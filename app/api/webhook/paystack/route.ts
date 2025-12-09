import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    // Verify that the request is from Paystack
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
      .update(JSON.stringify(req.body))
      .digest("hex")

    if (hash !== req.headers.get("x-paystack-signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = await req.json()

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulCharge(event.data)
        break
      case "transfer.success":
        // Handle transfer success
        break
      case "transfer.failed":
        // Handle transfer failure
        break
      default:
        // Handle other events
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleSuccessfulCharge(data: any) {
  const reference = data.reference
  const status = "success"

  // Update order status in database
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("reference", reference)

  if (error) {
    console.error("Error updating order status:", error)
    throw new Error("Failed to update order status")
  }

  // Here you could also trigger email notifications, etc.
}

export const maxDuration = 60 // Set max duration to 60 seconds

