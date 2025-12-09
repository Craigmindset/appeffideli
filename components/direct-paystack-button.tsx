"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// A simplified component for direct Paystack testing
export function DirectPaystackButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === "undefined" || !window.PaystackPop) {
        throw new Error("Paystack is not available")
      }

      const reference = `TEST_${Date.now()}`

      const handler = window.PaystackPop.setup({
        key: "pk_test_8d3fe55efb6fbecbf70cf1fa02846a3d838bb388",
        email: "customer@example.com",
        amount: 5000 * 100, // ₦5,000 in kobo
        currency: "NGN",
        ref: reference,
        firstname: "Test",
        lastname: "Customer",
        metadata: {
          custom_fields: [
            {
              display_name: "Test Payment",
              variable_name: "test_payment",
              value: "true",
            },
          ],
        },
        callback: (response: any) => {
          console.log("Payment successful:", response)
          setIsLoading(false)
          alert(`Payment successful! Reference: ${response.reference}`)
        },
        onClose: () => {
          console.log("Payment window closed")
          setIsLoading(false)
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error("Payment error:", error)
      setError(error instanceof Error ? error.message : "Payment initialization failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handlePayment} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Test Paystack Payment (₦5,000)"
        )}
      </Button>

      {error && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md">Error: {error}</div>}

      <div className="text-xs text-gray-500">
        This is a test button to verify Paystack integration. No actual charge will be made.
      </div>
    </div>
  )
}

