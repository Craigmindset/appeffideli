import { createClient } from "@vercel/postgres"
import fs from "fs"
import path from "path"

async function createSubscriptionTables() {
  try {
    const client = createClient()
    await client.connect()

    console.log("Connected to database")

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "database", "create-subscription-tables.sql")
    const sqlContent = fs.readFileSync(sqlPath, "utf8")

    // Execute the SQL
    await client.sql`${sqlContent}`

    console.log("Subscription tables created successfully")

    await client.end()
  } catch (error) {
    console.error("Error creating subscription tables:", error)
  }
}

createSubscriptionTables()

