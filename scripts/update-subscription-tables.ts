import { supabaseAdmin } from "@/lib/supabase"

async function updateSubscriptionTables() {
  try {
    console.log("Connected to database")

    // Try to create tables directly with SQL queries
    try {
      // Create subscription_tokens table
      const { error: tokensError } = await supabaseAdmin.query(`
        CREATE TABLE IF NOT EXISTS subscription_tokens (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          reference TEXT NOT NULL,
          pin TEXT,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      if (tokensError) {
        console.error("Error creating subscription_tokens table:", tokensError)
      } else {
        console.log("subscription_tokens table created or already exists")

        // Create indexes
        await supabaseAdmin.query(`
          CREATE INDEX IF NOT EXISTS idx_subscription_tokens_token ON subscription_tokens(token);
          CREATE INDEX IF NOT EXISTS idx_subscription_tokens_email ON subscription_tokens(email);
          CREATE INDEX IF NOT EXISTS idx_subscription_tokens_pin ON subscription_tokens(pin);
        `)
      }

      // Create subscription_downloads table
      const { error: downloadsError } = await supabaseAdmin.query(`
        CREATE TABLE IF NOT EXISTS subscription_downloads (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          reference TEXT NOT NULL,
          week INTEGER NOT NULL,
          downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(email, reference, week)
        );
      `)

      if (downloadsError) {
        console.error("Error creating subscription_downloads table:", downloadsError)
      } else {
        console.log("subscription_downloads table created or already exists")

        // Create index
        await supabaseAdmin.query(`
          CREATE INDEX IF NOT EXISTS idx_subscription_downloads_email_ref ON subscription_downloads(email, reference);
        `)
      }

      // Create feedback table
      const { error: feedbackError } = await supabaseAdmin.query(`
        CREATE TABLE IF NOT EXISTS feedback (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          reference TEXT,
          feedback TEXT NOT NULL,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      if (feedbackError) {
        console.error("Error creating feedback table:", feedbackError)
      } else {
        console.log("feedback table created or already exists")

        // Create index
        await supabaseAdmin.query(`
          CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);
        `)
      }

      console.log("Database schema updated successfully")
    } catch (sqlError) {
      console.error("Error executing SQL:", sqlError)

      // Fallback: Check if tables exist
      const { error: checkError } = await supabaseAdmin
        .from("subscription_tokens")
        .select("id") // Just select id instead of count(*)
        .limit(1)

      if (checkError) {
        if (checkError.code === "42P01") {
          console.error("Tables don't exist and couldn't be created")
        } else {
          console.error("Error checking tables:", checkError)
        }
      } else {
        console.log("Tables already exist")
      }
    }
  } catch (error) {
    console.error("Error updating database schema:", error)
  }
}

updateSubscriptionTables()

