import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { verifyPayment } from "@/app/actions/payment"
import { createSubscriptionAccess } from "@/app/actions/subscription"

export const metadata: Metadata = {
  title: "Subscription Access | Home Management",
  description: "Access your meal plan subscription",
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { email?: string; reference?: string }
}) {
  const { email, reference } = searchParams

  // If we have both email and reference from a successful payment, create access token and redirect to dashboard
  if (email && reference) {
    try {
      // Verify the payment was successful
      const paymentResult = await verifyPayment(reference)

      if (paymentResult.success && paymentResult.data?.data?.status === "success") {
        // Create subscription access token
        const accessResult = await createSubscriptionAccess(email, reference)

        if (accessResult.success) {
          // Redirect to dashboard with token
          redirect(`/subscription/dashboard?token=${accessResult.token}`)
        }
      }

      // If payment verification failed, redirect to payment failed page
      redirect(`/payment/failed?reference=${reference}`)
    } catch (err) {
      console.error("Error verifying subscription:", err)
      redirect(`/payment/failed?reference=${reference}`)
    }
  }

  // If no parameters, redirect to login page
  redirect("/subscription/login")
}

