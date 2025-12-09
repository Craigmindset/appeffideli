import { createClient } from "@supabase/supabase-js"

// This script should be run once to set up the database tables
async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("Setting up database tables...")

  // Create orders table if it doesn't exist
  const { error: ordersError } = await supabase.rpc("create_orders_table")

  if (ordersError) {
    console.error("Error creating orders table:", ordersError)

    // Try to create the table using SQL query if RPC fails
    const { error: sqlError } = await supabase.from("orders").select("count").limit(1)

    if (sqlError && sqlError.code === "42P01") {
      // Table doesn't exist
      console.log("Creating orders table using SQL...")

      const { error } = await supabase.query(`
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
      `)

      if (error) {
        console.error("Error creating orders table using SQL:", error)
      } else {
        console.log("Orders table created successfully")
      }
    } else {
      console.log("Orders table already exists")
    }
  } else {
    console.log("Orders table created successfully")
  }

  console.log("Database setup complete")
}

setupDatabase().catch(console.error)

