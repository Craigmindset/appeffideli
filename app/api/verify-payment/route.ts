import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/app/actions/payment"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json({ success: false, error: "Reference is required" }, { status: 400 })
  }

  try {
    // Verify the payment
    const result = await verifyPayment(reference)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during payment verification",
      },
      { status: 500 },
    )
  }
}

