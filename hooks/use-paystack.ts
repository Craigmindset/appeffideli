"use client"

import { useState, useEffect } from "react"
import { generatePaystackReference, calculateServiceAmount } from "@/lib/paystack"

interface PaystackConfig {
  key: string
  email: string
  amount: number
  currency: string
  ref: string
  firstname: string
  lastname: string
  phone: string
  plan?: string
  metadata?: any
  callback: (response: any) => void
  onClose: () => void
}

interface UsePaystackProps {
  email: string
  firstName: string
  lastName: string
  phone: string
  apartmentType: "studio" | "apartment" | "bungalow" | "duplex-terrace" | "duplex-balcony" | "infant-recipe"
  orderType: "download" | "print-deliver" | "subscription"
  amount?: number // Make amount optional in the hook props
  planCode?: string
  reference?: string
  onSuccess: (response: any) => void
  onClose: () => void
}

export function usePaystack({
  email,
  firstName,
  lastName,
  phone,
  apartmentType,
  orderType,
  amount,
  planCode,
  reference,
  onSuccess,
  onClose,
}: UsePaystackProps) {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Add Paystack script
    if (typeof window !== "undefined") {
      // Check if script already exists
      if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
        setIsReady(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true
      script.onload = () => setIsReady(true)
      script.onerror = () => setError("Failed to load Paystack")
      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [])

  // Updated to accept explicit parameters for more flexibility
  const initializePayment = (params?: Partial<PaystackConfig>) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!window.PaystackPop) {
        throw new Error("Paystack not available")
      }

      // Use provided params or fall back to props
      const paymentEmail = params?.email || email
      const paymentAmount = params?.amount || amount || calculateServiceAmount(apartmentType, orderType)
      const paymentReference = params?.ref || reference || generatePaystackReference()
      const paymentFirstName = params?.firstname || firstName
      const paymentLastName = params?.lastname || lastName
      const paymentPhone = params?.phone || phone
      const paymentMetadata = params?.metadata || {
        custom_fields: [
          {
            display_name: "Order Type",
            variable_name: "order_type",
            value: orderType,
          },
          {
            display_name: "Apartment Type",
            variable_name: "apartment_type",
            value: apartmentType,
          },
        ],
      }

      // Validate required fields
      if (!paymentEmail) throw new Error("Email is required")
      if (!paymentAmount) throw new Error("Amount is required")

      const config: PaystackConfig = {
        // Use a hardcoded key directly instead of environment variables
        key: "pk_test_8d3fe55efb6fbecbf70cf1fa02846a3d838bb388",
        email: paymentEmail,
        amount: paymentAmount * 100, // Paystack expects amount in kobo
        currency: "NGN",
        ref: paymentReference,
        firstname: paymentFirstName,
        lastname: paymentLastName,
        phone: paymentPhone,
        // Only add plan if planCode is provided and valid
        ...(planCode && planCode.startsWith("PLN_") ? { plan: planCode } : {}),
        metadata: paymentMetadata,
        callback: (response) => {
          console.log("Paystack payment callback received:", response)
          setIsLoading(false)
          onSuccess(response)
        },
        onClose: () => {
          console.log("Paystack payment modal closed")
          setIsLoading(false)
          onClose()
        },
      }

      console.log("Initializing Paystack with config:", {
        ...config,
        key: "HIDDEN_FOR_SECURITY", // Don't log the actual key
      })

      const handler = window.PaystackPop.setup(config)
      handler.openIframe()

      return paymentReference
    } catch (err) {
      setIsLoading(false)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("Paystack initialization error:", errorMessage)
      return null
    }
  }

  return {
    isReady,
    isLoading,
    error,
    initializePayment,
  }
}

