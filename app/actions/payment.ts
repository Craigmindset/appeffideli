"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { createSubscriptionAccess } from "./subscription"

export async function createOrder(orderData: {
  reference: string
  email: string
  firstName: string
  lastName: string
  phone: string
  state: string
  apartmentType: string
  orderType: string
  deliveryAddress: string
  landmark: string
  amount: number
}) {
  try {
    // Map camelCase properties to snake_case column names
    const dbOrderData = {
      reference: orderData.reference,
      email: orderData.email,
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      phone: orderData.phone,
      state: orderData.state,
      apartment_type: orderData.apartmentType,
      order_type: orderData.orderType,
      delivery_address: orderData.deliveryAddress,
      landmark: orderData.landmark,
      amount: orderData.amount,
      status: "pending", // Default status
    }

    const { error } = await supabaseAdmin.from("orders").insert([dbOrderData])
    if (error) {
      console.error("Error creating order:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: "Failed to create order" }
  }
}

// Update the verifyPayment function to handle infant recipe plans
export async function verifyPayment(reference: string) {
  try {
    console.log("Verifying payment for reference:", reference)

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Paystack API error:", errorData)
      throw new Error(errorData.message || "Failed to verify payment")
    }

    const data = await response.json()
    console.log("Paystack verification response:", data)

    // Update order status in database
    if (data.status === true) {
      const status = data.data.status === "success" ? "success" : "failed"
      console.log(`Updating order status to ${status}`)

      // Get order details to check if it's a download order
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("order_type, email, apartment_type, landmark")
        .eq("reference", reference)
        .maybeSingle() // Use maybeSingle instead of single to handle case where no order is found

      if (orderError) {
        console.error("Error fetching order details:", orderError)
        // Continue with the process even if we can't determine the order type
      }

      // Update the order status if an order was found
      if (orderData) {
        const { error } = await supabaseAdmin.from("orders").update({ status }).eq("reference", reference)

        if (error) {
          console.error("Error updating order status:", error)
          return { success: false, error: error.message }
        }

        // Revalidate the orders page if it exists
        revalidatePath("/orders")
      }

      // For subscription orders, create access token immediately
      if (orderData?.order_type === "subscription" && status === "success") {
        const email = orderData.email || data.data.customer.email
        const accessResult = await createSubscriptionAccess(email, reference)

        if (accessResult.success) {
          return {
            success: true,
            data,
            orderData,
            redirectUrl: `/subscription/dashboard?token=${accessResult.token}`,
          }
        }
      }

      // For download orders, redirect to download page instead of success page
      const isDownloadOrder = orderData?.order_type === "download"
      const isSubscriptionOrder = orderData?.order_type === "subscription"
      const isInfantRecipeOrder = orderData?.apartment_type === "infant-recipe"

      // Determine the appropriate redirect URL
      let redirectUrl = `/payment/failed?reference=${reference}`
      if (status === "success") {
        if (isDownloadOrder) {
          // Always include preferences for infant recipe plans
          const preferencesParam = isInfantRecipeOrder ? `?preferences=${orderData.landmark || ""}` : ""
          redirectUrl = `/download/${reference}${preferencesParam}`

          // Add extra logging for infant recipe plans
          if (isInfantRecipeOrder) {
            console.log("Infant recipe plan detected, redirecting to:", redirectUrl)
            console.log("Order details:", {
              reference,
              email: orderData.email,
              preferences: orderData.landmark,
              apartmentType: orderData.apartment_type,
            })
          }
        } else if (isSubscriptionOrder) {
          redirectUrl = `/subscription?email=${orderData?.email || data.data.customer.email}&reference=${reference}`
        } else {
          redirectUrl = `/payment/success?reference=${reference}`
        }
      }

      // Log the redirect URL for debugging
      console.log("Payment verification successful. Redirecting to:", redirectUrl)

      // Return success with redirect URL
      return {
        success: true,
        data,
        orderData,
        redirectUrl,
      }
    }

    return { success: true, data }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    console.error("Error verifying payment:", error)
    return { success: false, error: errorMessage }
  }
}

// Create a new function to handle subscription payments directly
export async function handleSubscriptionPayment(reference: string, email: string) {
  try {
    // First, verify the payment
    const paymentResult = await verifyPayment(reference)

    if (!paymentResult.success) {
      return { success: false, error: paymentResult.error }
    }

    if (paymentResult.data?.data?.status !== "success") {
      return { success: false, error: "Payment was not successful" }
    }

    // Check if an order exists for this reference
    const { data: existingOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle()

    // If no order exists, create one
    if (!existingOrder && !orderError) {
      // Extract customer data from Paystack response
      const customer = paymentResult.data.data.customer
      const amount = paymentResult.data.data.amount / 100 // Convert from kobo to naira

      // Create a new order
      const orderData = {
        reference,
        email: email || customer.email,
        firstName: customer.first_name || "Subscriber",
        lastName: customer.last_name || "User",
        phone: customer.phone || "",
        state: "",
        apartmentType: "apartment",
        orderType: "subscription",
        deliveryAddress: "",
        landmark: "",
        amount,
        status: "success",
      }

      // Insert the order directly with success status
      const { error } = await supabaseAdmin.from("orders").insert([
        {
          reference: orderData.reference,
          email: orderData.email,
          first_name: orderData.firstName,
          last_name: orderData.lastName,
          phone: orderData.phone,
          state: orderData.state,
          apartment_type: orderData.apartmentType,
          order_type: orderData.orderType,
          delivery_address: orderData.deliveryAddress,
          landmark: orderData.landmark,
          amount: orderData.amount,
          status: orderData.status,
        },
      ])

      if (error) {
        console.error("Error creating subscription order:", error)
        return { success: false, error: "Failed to create subscription record" }
      }
    }

    // Create subscription access token
    const accessResult = await createSubscriptionAccess(email, reference)

    if (!accessResult.success) {
      return { success: false, error: accessResult.error }
    }

    return {
      success: true,
      token: accessResult.token,
      redirectUrl: `/subscription/dashboard?token=${accessResult.token}`,
    }
  } catch (error) {
    console.error("Error handling subscription payment:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

