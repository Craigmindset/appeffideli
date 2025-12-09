import { type NextRequest, NextResponse } from "next/server"
import { handleSubscriptionPayment } from "@/app/actions/payment"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email")
  const reference = searchParams.get("reference")

  if (!email || !reference) {
    return NextResponse.json({ success: false, error: "Email and reference are required" }, { status: 400 })
  }

  try {
    const result = await handleSubscriptionPayment(reference, email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        token: result.token,
        redirectUrl: result.redirectUrl,
      })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing subscription:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

