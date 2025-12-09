import { Suspense } from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function PaymentFailedContent({ reference }: { reference: string }) {
  // Fetch order details from database if available
  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("reference", reference).single()

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <XCircle className="h-16 w-16 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
      <p className="mb-6">We were unable to process your payment.</p>

      {order && (
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
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Button asChild>
          <Link href="/services">Try Again</Link>
        </Button>
        <div>
          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailedPage({
  searchParams,
}: {
  searchParams: { reference?: string }
}) {
  const reference = searchParams.reference || ""

  return (
    <div className="container max-w-4xl py-12">
      <Suspense fallback={<div className="text-center">Loading payment details...</div>}>
        <PaymentFailedContent reference={reference} />
      </Suspense>
    </div>
  )
}

