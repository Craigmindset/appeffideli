import { Suspense } from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function PaymentSuccessContent({ reference }: { reference: string }) {
  // Fetch order details from database
  const { data: order, error } = await supabaseAdmin.from("orders").select("*").eq("reference", reference).single()

  if (error || !order) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
        <p className="mb-6">Thank you for your purchase!</p>
        <p className="text-sm text-muted-foreground mb-6">Reference: {reference}</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
      <p className="mb-6">Thank you for your purchase, {order.first_name}!</p>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto text-left">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference:</span>
            <span>{order.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span>₦{order.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span>Household Chore Routine Management</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Home Type:</span>
            <span>{order.apartment_type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Type:</span>
            <span>{order.order_type === "download" ? "Download PDF" : "Print & Deliver"}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {order.order_type === "download"
            ? "Your Household Chore Routine Management PDF will be sent to your email shortly."
            : "Your Household Chore Routine Management will be printed and delivered to your address."}
        </p>
      </div>

      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { reference?: string }
}) {
  const reference = searchParams.reference || ""

  return (
    <div className="container max-w-4xl py-12">
      <Suspense fallback={<div className="text-center">Loading payment details...</div>}>
        <PaymentSuccessContent reference={reference} />
      </Suspense>
    </div>
  )
}

