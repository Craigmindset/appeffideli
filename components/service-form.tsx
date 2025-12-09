"use client"
import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePaystack } from "@/hooks/use-paystack"
import { useRouter } from "next/navigation"
import { createOrder, verifyPayment } from "@/app/actions/payment"

// Add Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackProps) => {
        openIframe: () => void
      }
    }
  }
}

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
]

const serviceCharges = {
  studio: 15000,
  apartment: 20000,
  bungalow: 25000,
  "duplex-terrace": 35000,
  "duplex-balcony": 30000,
} as const

// Format number to Nigerian Naira
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  state: z.string().min(1, "Please select a state"),
  apartmentType: z.enum(["studio", "apartment", "bungalow", "duplex-terrace", "duplex-balcony"], {
    required_error: "Please select an apartment type",
  }),
  orderType: z.enum(["download", "print-deliver"], {
    required_error: "Please select an order type",
  }),
  deliveryAddress: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  landmark: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)),
})

interface PaystackProps {
  key: string
  email: string
  amount: number
  ref: string
  currency: string
  firstname: string
  lastname: string
  phone: string
  metadata: any
  callback: (response: any) => void
  onClose: () => void
}

type ServiceFormProps = {
  onBack: () => void
}

export default function ServiceForm({ onBack }: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      state: "",
      apartmentType: undefined,
      orderType: undefined,
      deliveryAddress: "",
      landmark: "",
    },
  })

  const watchOrderType = form.watch("orderType")
  const watchApartmentType = form.watch("apartmentType")

  // Reset delivery address when "download" is selected
  useEffect(() => {
    if (watchOrderType === "download") {
      form.setValue("deliveryAddress", "")
      form.setValue("landmark", "")
    }
  }, [watchOrderType, form])

  // Show appropriate modal when order type changes
  useEffect(() => {
    if (watchOrderType === "download") {
      setShowDownloadModal(true)
    } else if (watchOrderType === "print-deliver") {
      setShowDeliveryModal(true)
    }
  }, [watchOrderType])

  // Add Paystack script
  useEffect(() => {
    // Add Paystack script only on client side
    if (typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "https://js.paystack.co/v1/inline.js"
      script.async = true

      // Add an onload handler to ensure the script is fully loaded
      script.onload = () => {
        console.log("Paystack script loaded successfully")
      }

      // Add an error handler
      script.onerror = () => {
        console.error("Failed to load Paystack script")
        setErrorMessage("Payment service failed to load. Please refresh the page and try again.")
      }

      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Validate required fields
      if (!values.apartmentType) {
        throw new Error("Please select an apartment type")
      }

      if (!values.orderType) {
        throw new Error("Please select an order type")
      }

      if (values.orderType === "print-deliver" && !values.deliveryAddress) {
        throw new Error("Delivery address is required for Print & Deliver option")
      }

      // Calculate amount
      const amount = serviceCharges[values.apartmentType] + (values.orderType === "print-deliver" ? 9000 : 0)

      // Generate a unique reference
      const reference = `EFFIDELI_${Math.floor(Math.random() * 1000000000)}_${Date.now()}`

      console.log("Creating order with data:", {
        reference,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        state: values.state,
        apartmentType: values.apartmentType,
        orderType: values.orderType,
        deliveryAddress: values.deliveryAddress || "",
        landmark: values.landmark || "",
        amount,
      })

      // First, create the order in the database
      const orderResult = await createOrder({
        reference,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        state: values.state,
        apartmentType: values.apartmentType,
        orderType: values.orderType,
        deliveryAddress: values.deliveryAddress || "",
        landmark: values.landmark || "",
        amount,
      })

      if (!orderResult.success) {
        console.error("Order creation failed:", orderResult)
        throw new Error(orderResult.error || "Failed to create order. Please check your database connection.")
      }

      console.log("Order created successfully, initializing payment")

      // Initialize Paystack payment
      if (typeof window !== "undefined" && window.PaystackPop) {
        try {
          const handler = window.PaystackPop.setup({
            key: "pk_test_8d3fe55efb6fbecbf70cf1fa02846a3d838bb388",
            email: values.email,
            amount: amount * 100, // Paystack expects amount in kobo (multiply by 100)
            currency: "NGN",
            ref: reference,
            firstname: values.firstName,
            lastname: values.lastName,
            phone: values.phone,
            metadata: {
              custom_fields: [
                {
                  display_name: "Order Type",
                  variable_name: "order_type",
                  value: values.orderType,
                },
                {
                  display_name: "Apartment Type",
                  variable_name: "apartment_type",
                  value: values.apartmentType,
                },
              ],
            },
            callback: (response) => {
              console.log("Payment callback received:", response)
              // Use a regular function to avoid 'this' binding issues
              verifyPayment(response.reference)
                .then((result) => {
                  console.log("Payment verification result:", result)
                  if (result.success && result.redirectUrl) {
                    // Handle redirect on the client side
                    window.location.href = result.redirectUrl
                  } else {
                    setIsSubmitting(false)
                  }
                })
                .catch((verifyError) => {
                  console.error("Payment verification error:", verifyError)
                  setErrorMessage("Payment verification failed. Please contact support.")
                  setIsSubmitting(false)
                })
            },
            onClose: () => {
              console.log("Payment modal closed")
              setIsSubmitting(false)
            },
          })

          handler.openIframe()
        } catch (paystackError) {
          console.error("Paystack setup error:", paystackError)
          throw new Error(
            "Failed to initialize payment: " +
              (paystackError instanceof Error ? paystackError.message : "Unknown error"),
          )
        }
      } else {
        // Fallback if Paystack is not available
        console.error("Paystack not available")
        throw new Error("Payment service is currently unavailable. Please try again later.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const paystack = usePaystack({
    email: form.watch("email"),
    firstName: form.watch("firstName"),
    lastName: form.watch("lastName"),
    phone: form.watch("phone"),
    apartmentType: form.watch("apartmentType") as any,
    orderType: form.watch("orderType") as any,
    onSuccess: async (response) => {
      // Verify the payment on the server
      await verifyPayment(response.reference)

      // Redirect to success page
      router.push(`/payment/success?reference=${response.reference}`)
    },
    onClose: () => {
      setIsSubmitting(false)
    },
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Household Chore Routine Management
          <br />
          <span className="underline text-red-900 dark:text-red-700">Purchased Plan</span>
        </h2>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]" position="popper">
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="apartmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select apartment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="bungalow">Bungalow</SelectItem>
                        <SelectItem value="duplex-terrace">Duplex with Terrace view</SelectItem>
                        <SelectItem value="duplex-balcony">Duplex with Balcony</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchApartmentType && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Purchase Plan:</span>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(
                            serviceCharges[watchApartmentType] + (watchOrderType === "print-deliver" ? 9000 : 0),
                          )}
                        </span>
                      </div>
                      {watchOrderType === "print-deliver" && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Delivery Cost:</span>
                            <span>{formatCurrency(7000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Printing Cost:</span>
                            <span>{formatCurrency(2000)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <FormField
              control={form.control}
              name="orderType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Order Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="download" />
                        </FormControl>
                        <FormLabel className="font-normal">Download PDF</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="print-deliver" />
                        </FormControl>
                        <FormLabel className="font-normal">Print & Deliver</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchOrderType === "print-deliver" && (
              <>
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Delivery Address <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your complete delivery address" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="landmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landmark</FormLabel>
                      <FormControl>
                        <Input placeholder="Make delivery easy, identify any landmark here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Processing Payment..."
                : `Pay Now ${watchApartmentType ? formatCurrency(serviceCharges[watchApartmentType] + (watchOrderType === "print-deliver" ? 9000 : 0)) : ""}`}
            </Button>
          </form>
        </Form>
      </div>
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Information</DialogTitle>
            <DialogDescription>
              Thank you for choosing Effideli, your Household Chore Routine Management will be sent to your email upon
              payment.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowDownloadModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery Information</DialogTitle>
            <DialogDescription>
              Thank you for choosing Effideli. Please note an additional cost for the Printing and the delivery cost
              will be added to the request.
            </DialogDescription>
            <div className="font-semibold text-destructive mt-2">
              Important: Our delivery services are currently only available within Lagos State.
            </div>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowDeliveryModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

