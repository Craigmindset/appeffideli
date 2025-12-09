"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Function to ensure subscription tables exist without using RPC
async function ensureTablesExist() {
  try {
    // Check if subscription_tokens table exists
    const { error: tokensError } = await supabaseAdmin
      .from("subscription_tokens")
      .select("id") // Just select id instead of count(*)
      .limit(1)

    if (tokensError) {
      if (tokensError.code === "42P01") {
        console.log("subscription_tokens table doesn't exist, creating it")

        // Create subscription_tokens table - removed PIN field
        const { error: createError } = await supabaseAdmin.query(`
          CREATE TABLE IF NOT EXISTS subscription_tokens (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            reference TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)

        if (createError) {
          console.error("Error creating subscription_tokens table:", createError)
          return false
        }

        // Create index on token
        await supabaseAdmin.query(`
          CREATE INDEX IF NOT EXISTS idx_subscription_tokens_token ON subscription_tokens(token);
        `)

        // Create index on email
        await supabaseAdmin.query(`
          CREATE INDEX IF NOT EXISTS idx_subscription_tokens_email ON subscription_tokens(email);
        `)
      } else {
        console.error("Error checking subscription_tokens table:", tokensError)
        return false
      }
    }

    // Check if subscription_downloads table exists
    const { error: downloadsError } = await supabaseAdmin.from("subscription_downloads").select("id").limit(1)

    if (downloadsError) {
      if (downloadsError.code === "42P01") {
        console.log("subscription_downloads table doesn't exist, creating it")

        // Create subscription_downloads table
        const { error: createError } = await supabaseAdmin.query(`
          CREATE TABLE IF NOT EXISTS subscription_downloads (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            reference TEXT NOT NULL,
            week INTEGER NOT NULL,
            downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(email, reference, week)
          );
        `)

        if (createError) {
          console.error("Error creating subscription_downloads table:", createError)
          return false
        }

        // Create index on email and reference
        await supabaseAdmin.query(`
          CREATE INDEX IF NOT EXISTS idx_subscription_downloads_email_ref ON subscription_downloads(email, reference);
        `)
      } else {
        console.error("Error checking subscription_downloads table:", downloadsError)
        return false
      }
    }

    // Check if feedback table exists
    const { error: feedbackError } = await supabaseAdmin.from("feedback").select("id").limit(1)

    if (feedbackError) {
      if (feedbackError.code === "42P01") {
        console.log("feedback table doesn't exist, creating it")

        // Create feedback table
        const { error: createError } = await supabaseAdmin.query(`
          CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            reference TEXT,
            feedback TEXT NOT NULL,
            submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `)

        if (createError) {
          console.error("Error creating feedback table:", createError)
          return false
        }

        // Create index on email
        await supabaseAdmin.query(`
          CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);
        `)
      } else {
        console.error("Error checking feedback table:", feedbackError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error ensuring tables exist:", error)
    return false
  }
}

// Generate a random token without using crypto
function generateToken(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""

  // Add timestamp for uniqueness
  token += Date.now().toString(36) + "-"

  // Add random characters
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}

// Create subscription access token
export async function createSubscriptionAccess(email: string, reference?: string) {
  try {
    // Ensure tables exist
    await ensureTablesExist()

    // Generate a secure token
    const token = generateToken(32)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Token expires in 1 year

    // Insert token using Supabase
    const { error } = await supabaseAdmin.from("subscription_tokens").insert({
      email,
      token,
      reference: reference || "",
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Error creating token:", error)
      return { success: false, error: "Failed to create access token" }
    }

    return { success: true, token }
  } catch (error) {
    console.error("Error creating subscription access:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Verify subscription access token
export async function verifySubscriptionAccess(token: string) {
  try {
    // Ensure tables exist
    await ensureTablesExist()

    // Get token from database using Supabase
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("subscription_tokens")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return { success: false, error: "Invalid or expired access token" }
    }

    // Get subscription details
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("reference", tokenData.reference)
      .eq("status", "success")
      .single()

    if (orderError || !orderData) {
      return { success: false, error: "Subscription not found" }
    }

    return {
      success: true,
      email: tokenData.email,
      reference: tokenData.reference,
      subscriptionDate: orderData.created_at,
    }
  } catch (error) {
    console.error("Error verifying subscription access:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get subscription status and available weeks
export async function getSubscriptionStatus(token: string) {
  try {
    // Verify access token
    const accessResult = await verifySubscriptionAccess(token)
    if (!accessResult.success) {
      return { success: false, error: accessResult.error }
    }

    // Ensure tables exist
    await ensureTablesExist()

    // Calculate which weeks are available based on subscription date
    const subscriptionDate = new Date(accessResult.subscriptionDate)
    const currentDate = new Date()
    const daysSinceSubscription = Math.floor(
      (currentDate.getTime() - subscriptionDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    // Calculate access dates for each week
    const week1AccessDate = new Date(subscriptionDate)
    const week2AccessDate = new Date(subscriptionDate)
    week2AccessDate.setDate(week2AccessDate.getDate() + 7)
    const week3AccessDate = new Date(subscriptionDate)
    week3AccessDate.setDate(week3AccessDate.getDate() + 14)
    const week4AccessDate = new Date(subscriptionDate)
    week4AccessDate.setDate(week4AccessDate.getDate() + 21)

    // Week 1 is available immediately, other weeks become available after 7, 14, and 21 days
    const availableWeeks = [
      {
        week: 1,
        available: true,
        downloaded: false,
        accessDate: week1AccessDate.toISOString(),
      },
      {
        week: 2,
        available: daysSinceSubscription >= 7,
        downloaded: false,
        accessDate: week2AccessDate.toISOString(),
      },
      {
        week: 3,
        available: daysSinceSubscription >= 14,
        downloaded: false,
        accessDate: week3AccessDate.toISOString(),
      },
      {
        week: 4,
        available: daysSinceSubscription >= 21,
        downloaded: false,
        accessDate: week4AccessDate.toISOString(),
      },
    ]

    // Get download history using Supabase
    const { data: downloadData, error: downloadError } = await supabaseAdmin
      .from("subscription_downloads")
      .select("*")
      .eq("email", accessResult.email)
      .eq("reference", accessResult.reference)

    if (downloadError) {
      console.error("Error fetching downloads:", downloadError)
    } else if (downloadData) {
      // Mark weeks as downloaded
      downloadData.forEach((download) => {
        const weekIndex = availableWeeks.findIndex((w) => w.week === download.week)
        if (weekIndex !== -1) {
          availableWeeks[weekIndex].downloaded = true
        }
      })
    }

    // Get preview images for each week
    const weeklyImages = [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/42589.jpg-2JalJ2wZP2G1UvWWaYqQs7kDCO0590.jpeg", // Week 1 image - Updated
      "/placeholder.svg?height=200&width=300", // Week 2 image
      "/placeholder.svg?height=200&width=300", // Week 3 image
      "/placeholder.svg?height=200&width=300", // Week 4 image
    ]

    return {
      success: true,
      email: accessResult.email,
      reference: accessResult.reference,
      weeks: availableWeeks,
      images: weeklyImages,
      allDownloaded: availableWeeks.filter((w) => w.available).every((w) => w.downloaded),
      subscriptionStatus: "active",
      subscriptionEndDate: new Date(subscriptionDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }
  } catch (error) {
    console.error("Error getting subscription status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Download weekly plan
export async function downloadWeeklyPlan(token: string, week: number) {
  try {
    // Verify access token
    const accessResult = await verifySubscriptionAccess(token)
    if (!accessResult.success) {
      return { success: false, error: accessResult.error }
    }

    // Ensure tables exist
    await ensureTablesExist()

    // Check if week is available
    const statusResult = await getSubscriptionStatus(token)
    if (!statusResult.success) {
      return { success: false, error: statusResult.error }
    }

    const weekData = statusResult.weeks.find((w) => w.week === week)
    if (!weekData) {
      return { success: false, error: "Invalid week" }
    }

    if (!weekData.available) {
      return { success: false, error: "This week is not available yet" }
    }

    // Record the download if not already downloaded
    if (!weekData.downloaded) {
      const { error: insertError } = await supabaseAdmin
        .from("subscription_downloads")
        .insert({
          email: accessResult.email,
          reference: accessResult.reference,
          week,
        })
        .onConflict(["email", "reference", "week"])
        .ignore()

      if (insertError) {
        console.error("Error recording download:", insertError)
      }
    }

    // Get PDF URL based on week
    let pdfUrl = ""
    switch (week) {
      case 1:
        pdfUrl = "https://example.com/week1.pdf" // Replace with actual URL from Vercel Blob
        break
      case 2:
        pdfUrl = "https://example.com/week2.pdf" // Replace with actual URL from Vercel Blob
        break
      case 3:
        pdfUrl = "https://example.com/week3.pdf" // Replace with actual URL from Vercel Blob
        break
      case 4:
        pdfUrl = "https://example.com/week4.pdf" // Replace with actual URL from Vercel Blob
        break
      default:
        return { success: false, error: "Invalid week" }
    }

    // Revalidate the dashboard page
    revalidatePath("/subscription/dashboard")

    return { success: true, pdfUrl }
  } catch (error) {
    console.error("Error downloading weekly plan:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Submit feedback
export async function submitFeedback(token: string, feedback: string) {
  try {
    // Verify access token
    const accessResult = await verifySubscriptionAccess(token)
    if (!accessResult.success) {
      return { success: false, error: accessResult.error }
    }

    // Ensure tables exist
    await ensureTablesExist()

    // Store feedback in database using Supabase
    const { error } = await supabaseAdmin.from("feedback").insert({
      email: accessResult.email,
      reference: accessResult.reference,
      feedback,
    })

    if (error) {
      console.error("Error submitting feedback:", error)
      return { success: false, error: "Failed to submit feedback" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get subscription by email
export async function getSubscriptionByEmail(email: string) {
  try {
    // Ensure tables exist
    await ensureTablesExist()

    // Check if user has an active subscription
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("email", email)
      .eq("order_type", "subscription")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)

    if (orderError) {
      console.error("Error fetching subscription:", orderError)
      return { success: false, error: "Failed to fetch subscription details" }
    }

    if (!orderData || orderData.length === 0) {
      return { success: false, error: "No active subscription found" }
    }

    // Check if a token already exists
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("subscription_tokens")
      .select("*")
      .eq("email", email)
      .eq("reference", orderData[0].reference)
      .order("created_at", { ascending: false })
      .limit(1)

    if (tokenError) {
      console.error("Error fetching token:", tokenError)
      return { success: false, error: "Failed to fetch token" }
    }

    // If token exists, return it
    if (tokenData && tokenData.length > 0) {
      return {
        success: true,
        token: tokenData[0].token,
        reference: orderData[0].reference,
      }
    }

    // Otherwise create a new token
    const result = await createSubscriptionAccess(email, orderData[0].reference)
    return result
  } catch (error) {
    console.error("Error getting subscription by email:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function createSubscriptionPin({
  email,
  reference,
  pin,
}: { email: string; reference: string; pin: string }) {
  try {
    // Ensure tables exist
    await ensureTablesExist()

    // Update the token with the PIN
    const { error } = await supabaseAdmin
      .from("subscription_tokens")
      .update({ pin })
      .eq("email", email)
      .eq("reference", reference)

    if (error) {
      console.error("Error creating PIN:", error)
      return { success: false, error: "Failed to create PIN" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating subscription PIN:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

