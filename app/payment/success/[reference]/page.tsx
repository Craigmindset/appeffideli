import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PaymentSuccessRedirect({
  params,
}: {
  params: { reference: string }
}) {
  const reference = params.reference

  if (!reference) {
    redirect("/")
  }

  try {
    // Check if this is an infant recipe order
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("apartment_type, order_type, landmark")
      .eq("reference", reference)
      .eq("status", "success")
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      redirect(`/payment/success?reference=${reference}`)
    }

    // If it's an infant recipe download, redirect to download page
    if (order && order.apartment_type === "infant-recipe" && order.order_type === "download") {
      const preferencesParam = order.landmark ? `?preferences=${order.landmark}` : ""
      redirect(`/download/${reference}${preferencesParam}`)
    }

    // Otherwise, redirect to the general success page
    redirect(`/payment/success?reference=${reference}`)
  } catch (error) {
    console.error("Error in payment success redirect:", error)
    redirect(`/payment/success?reference=${reference}`)
  }
}

