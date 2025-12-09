import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get("reference")
  const trxref = searchParams.get("trxref")

  // Use either reference parameter
  const paymentReference = reference || trxref

  if (!paymentReference) {
    return NextResponse.json({ success: false, error: "Payment reference is required" }, { status: 400 })
  }

  try {
    // Check if this is an infant recipe order
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("apartment_type, order_type, landmark, status")
      .eq("reference", paymentReference)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({
        success: false,
        error: "Order not found",
        redirectUrl: `/payment/success?reference=${paymentReference}`,
      })
    }

    // If payment was successful and it's an infant recipe download
    if (order.status === "success" && order.apartment_type === "infant-recipe" && order.order_type === "download") {
      const preferencesParam = order.landmark ? `?preferences=${order.landmark}` : ""
      const redirectUrl = `/download/${paymentReference}${preferencesParam}`

      return NextResponse.json({
        success: true,
        redirectUrl,
      })
    }

    // For other successful payments
    if (order.status === "success") {
      return NextResponse.json({
        success: true,
        redirectUrl: `/payment/success?reference=${paymentReference}`,
      })
    }

    // For failed payments
    return NextResponse.json({
      success: false,
      redirectUrl: `/payment/failed?reference=${paymentReference}`,
    })
  } catch (error) {
    console.error("Error processing payment completion:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        redirectUrl: `/payment/success?reference=${paymentReference}`,
      },
      { status: 500 },
    )
  }
}

