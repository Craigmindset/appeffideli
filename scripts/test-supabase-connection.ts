import { createClient } from "@supabase/supabase-js"

async function testSupabaseConnection() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("Testing Supabase connection...")
  console.log("Supabase URL:", supabaseUrl ? "Set" : "Not set")
  console.log("Supabase Key:", supabaseKey ? "Set" : "Not set")

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    return
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test connection by getting the server version
    const { data, error } = await supabase.rpc("get_server_version")

    if (error) {
      console.error("Error connecting to Supabase:", error)
    } else {
      console.log("Successfully connected to Supabase!")
      console.log("Server version:", data)

      // Check if orders table exists
      const { error: tableError } = await supabase.from("orders").select("count").limit(1)

      if (tableError) {
        console.error("Error accessing orders table:", tableError)
        console.log(
          "The orders table may not exist. Please create it using the SQL in database/create-orders-table.sql",
        )
      } else {
        console.log("Orders table exists and is accessible")
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

testSupabaseConnection()

