import { type NextRequest, NextResponse } from "next/server"
import { getPdfUrl } from "@/app/actions/pdf"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get("reference")
  const preferences = searchParams.get("preferences") || ""

  if (!reference) {
    return NextResponse.json({ success: false, error: "Reference is required" }, { status: 400 })
  }

  try {
    // Verify the order exists and is successful
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("apartment_type, order_type, status")
      .eq("reference", reference)
      .eq("status", "success")
      .single()

    if (error || !order) {
      return NextResponse.json({ success: false, error: "Order not found or payment not successful" }, { status: 404 })
    }

    // Get the PDF URL
    const pdfUrl = await getPdfUrl(order.apartment_type, order.order_type, preferences)

    // Return the PDF URL
    return NextResponse.json({
      success: true,
      pdfUrl,
      fileName:
        order.apartment_type === "infant-recipe"
          ? "Effideli-Infant-Recipe-Plan.pdf"
          : `Effideli-${order.apartment_type}-Routine.pdf`,
    })
  } catch (error) {
    console.error("Error getting PDF URL:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get PDF URL",
        // Provide a fallback URL
        fallbackUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
      { status: 500 },
    )
  }
}

