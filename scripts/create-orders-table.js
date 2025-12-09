import { createClient } from "@supabase/supabase-js"

// Use the provided credentials
const supabaseUrl = "https://wkqorrmqikhqwrpgrijr.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcW9ycm1xaWtocXdycGdyaWpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTAwMTg1NywiZXhwIjoyMDU2NTc3ODU3fQ.DI4ZGLGtdFpirfDNBMesJgjGKQXMOzbSzBTGLg1hzbU"

// Create a Supabase admin client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndCreateOrdersTable() {
  console.log("Checking if orders table exists...")

  try {
    // Try to query the orders table
    const { data, error } = await supabase.from("orders").select("count").limit(1)

    if (error) {
      if (error.code === "42P01") {
        console.log("Orders table doesn't exist. Creating it now...")

        // Create the orders table
        const createTableResult = await supabase.rpc("create_orders_table")

        if (createTableResult.error) {
          console.error("Error creating orders table via RPC:", createTableResult.error)

          // Try direct SQL as fallback
          const { error: sqlError } = await supabase.sql(`
            CREATE TABLE IF NOT EXISTS orders (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              reference TEXT UNIQUE NOT NULL,
              email TEXT NOT NULL,
              first_name TEXT NOT NULL,
              last_name TEXT NOT NULL,
              phone TEXT NOT NULL,
              state TEXT NOT NULL,
              apartment_type TEXT NOT NULL,
              order_type TEXT NOT NULL,
              delivery_address TEXT,
              landmark TEXT,
              amount INTEGER NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `)

          if (sqlError) {
            console.error("Error creating orders table via SQL:", sqlError)
            return { success: false, error: sqlError }
          }

          console.log("Orders table created successfully via SQL")
        } else {
          console.log("Orders table created successfully via RPC")
        }

        // Insert a test record to verify the table works
        const testOrder = {
          reference: `TEST_${Date.now()}`,
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          phone: "1234567890",
          state: "Lagos",
          apartment_type: "studio",
          order_type: "download",
          amount: 15000,
          status: "pending",
        }

        const { error: insertError } = await supabase.from("orders").insert(testOrder)

        if (insertError) {
          console.error("Error inserting test record:", insertError)
          return { success: false, error: insertError }
        }

        console.log("Test record inserted successfully")

        // Delete the test record
        const { error: deleteError } = await supabase.from("orders").delete().eq("reference", testOrder.reference)

        if (deleteError) {
          console.error("Error deleting test record:", deleteError)
        } else {
          console.log("Test record deleted successfully")
        }

        return { success: true, message: "Orders table created and tested successfully" }
      } else {
        console.error("Error checking orders table:", error)
        return { success: false, error }
      }
    } else {
      console.log("Orders table exists and is accessible")
      return { success: true, message: "Orders table exists and is accessible" }
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error }
  }
}

// Run the function
checkAndCreateOrdersTable()
  .then((result) => {
    console.log("Result:", result)
    if (result.success) {
      console.log("✅ Database setup complete")
    } else {
      console.log("❌ Database setup failed")
    }
  })
  .catch((error) => {
    console.error("Script execution failed:", error)
  })

