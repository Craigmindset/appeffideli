import { createClient } from "@supabase/supabase-js"

// Use the provided credentials
const supabaseUrl = "https://wkqorrmqikhqwrpgrijr.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcW9ycm1xaWtocXdycGdyaWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDE4NTcsImV4cCI6MjA1NjU3Nzg1N30.FuzmW9fmPrR9aLVz1bXb5gtPO3Co6rl380mTCtEv_GU"

// For server-side operations, we need the service role key
// This will need to be added to your environment variables
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcW9ycm1xaWtocXdycGdyaWpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTAwMTg1NywiZXhwIjoyMDU2NTc3ODU3fQ.DI4ZGLGtdFpirfDNBMesJgjGKQXMOzbSzBTGLg1hzbU"

// Create a Supabase client with the anonymous key for client-side operations
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session in server components
  },
})

// Create a Supabase admin client with the service role key for server-side operations
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false, // Don't persist session in server components
      },
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })

// Database types
export type Order = {
  id: string
  reference: string
  email: string
  first_name: string
  last_name: string
  phone: string
  state: string
  apartment_type: string
  order_type: string
  delivery_address?: string
  landmark?: string
  amount: number
  status: "pending" | "success" | "failed"
  created_at: string
  updated_at: string
}

// Helper function to check if Supabase is properly configured
export async function checkSupabaseConnection() {
  try {
    console.log("Checking Supabase connection...")

    // First check if we can connect at all
    const { data: healthData, error: healthError } = await supabaseAdmin.from("_health").select("*").limit(1).single()

    if (healthError) {
      console.error("Supabase health check failed:", healthError)
      return {
        success: false,
        error: healthError.message,
        details: healthError.details,
        code: healthError.code,
        hint: "Connection to Supabase failed. Check your credentials and network.",
      }
    }

    // Then check if the orders table exists and is accessible
    const { data, error } = await supabaseAdmin.from("orders").select("count").limit(1)

    if (error) {
      console.error("Supabase orders table check failed:", error)
      return {
        success: false,
        error: error.message,
        details: error.details,
        code: error.code,
        hint:
          error.code === "42P01"
            ? "The orders table doesn't exist. Run the database setup script."
            : "Check permissions for the orders table.",
      }
    }

    console.log("Supabase connection successful:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error checking Supabase connection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error checking Supabase connection",
      stack: error instanceof Error ? error.stack : undefined,
    }
  }
}

