import { createClient } from "@supabase/supabase-js"

// Use the provided credentials
const supabaseUrl = "https://wkqorrmqikhqwrpgrijr.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcW9ycm1xaWtocXdycGdyaWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDE4NTcsImV4cCI6MjA1NjU3Nzg1N30.FuzmW9fmPrR9aLVz1bXb5gtPO3Co6rl380mTCtEv_GU"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcW9ycm1xaWtocXdycGdyaWpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTAwMTg1NywiZXhwIjoyMDU2NTc3ODU3fQ.DI4ZGLGtdFpirfDNBMesJgjGKQXMOzbSzBTGLg1hzbU"

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  console.log("Testing Supabase connection...")

  try {
    // Test connection by getting the server version
    const { data, error } = await supabase.rpc("get_server_version")

    if (error) {
      console.error("❌ Error connecting to Supabase:", error)
      return
    }

    console.log("✅ Successfully connected to Supabase!")
    console.log("Server version:", data)

    // Check if orders table exists
    console.log("\nChecking if orders table exists...")
    const { error: tableError } = await supabase.from("orders").select("count").limit(1)

    if (tableError) {
      console.error("❌ Error accessing orders table:", tableError)

      if (tableError.code === "42P01") {
        console.log("\nThe orders table does not exist. Let's create it now...")

        // Create the orders table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            reference TEXT NOT NULL UNIQUE,
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
          
          CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
          CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
          
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          
          DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
          CREATE TRIGGER update_orders_updated_at
          BEFORE UPDATE ON orders
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `

        const { error: createError } = await supabase.rpc("exec", { query: createTableSQL })

        if (createError) {
          console.error("❌ Error creating orders table:", createError)
          console.log("\nPlease create the orders table manually using the SQL in database/create-orders-table.sql")
        } else {
          console.log("✅ Orders table created successfully!")
        }
      }
    } else {
      console.log("✅ Orders table exists and is accessible!")
    }

    // Insert a test order
    console.log("\nInserting a test order...")
    const testOrder = {
      reference: `TEST_${Date.now()}`,
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      phone: "1234567890",
      state: "Lagos",
      apartment_type: "apartment",
      order_type: "download",
      amount: 20000,
      status: "pending",
    }

    const { data: insertData, error: insertError } = await supabase.from("orders").insert(testOrder).select()

    if (insertError) {
      console.error("❌ Error inserting test order:", insertError)
    } else {
      console.log("✅ Test order inserted successfully!")
      console.log("Test order data:", insertData)

      // Clean up test order
      console.log("\nCleaning up test order...")
      const { error: deleteError } = await supabase.from("orders").delete().eq("reference", testOrder.reference)

      if (deleteError) {
        console.error("❌ Error deleting test order:", deleteError)
      } else {
        console.log("✅ Test order deleted successfully!")
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

testConnection()

