"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Baby, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { usePaystack } from "@/hooks/use-paystack"
import { generatePaystackReference } from "@/lib/paystack"
import { createOrder } from "@/app/actions/payment"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
// Add this import at the top of the file
import { DirectDownloadButton } from "@/components/direct-download-button"

// Format number to Nigerian Naira
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const SERVICE_CHARGE = 50000

const formSchema = z.object({
  // Parent Details
  parentFirstName: z.string().min(2, "First name must be at least 2 characters"),
  parentLastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),

  // Child Details
  childFirstName: z.string().min(2, "First name must be at least 2 characters"),
  childLastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select gender",
  }),
  age: z.string().min(1, "Age is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  // Allergies
  hasAllergies: z.enum(["yes", "no"], {
    required_error: "Please indicate if there are any allergies",
  }),
  allergiesDetails: z.string().optional(),

  // Recipe Preferences
  recipePreferences: z.array(z.string()).min(1, "Please select at least one preference"),
})

type InfantRecipeFormProps = {
  onBack: () => void
}

const recipePreferences = [
  { id: "allergies", label: "Allergies Conscious" },
  { id: "sweet", label: "Sweet Tooth Preferences" },
  { id: "nutrition", label: "Nutrition Goals" },
]

export default function InfantRecipeForm({ onBack }: InfantRecipeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reference, setReference] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentFirstName: "",
      parentLastName: "",
      email: "",
      phone: "",
      childFirstName: "",
      childLastName: "",
      gender: undefined,
      age: "",
      dateOfBirth: "",
      hasAllergies: undefined,
      allergiesDetails: "",
      recipePreferences: [],
    },
  })

  const watchHasAllergies = form.watch("hasAllergies")

  // Initialize Paystack
  const {
    isReady,
    isLoading,
    error: paystackError,
    initializePayment,
  } = usePaystack({
    email: form.getValues("email"),
    firstName: form.getValues("parentFirstName"),
    lastName: form.getValues("parentLastName"),
    phone: form.getValues("phone"),
    apartmentType: "infant-recipe", // Special type for infant recipe
    orderType: "download", // This is a download product
    reference: reference, // Use the stored reference
    amount: SERVICE_CHARGE, // Add the amount directly here
    onSuccess: async (response) => {
      console.log("Payment successful, processing redirection...", response)

      try {
        // Verify the payment on the server
        const verificationResult = await fetch(`/api/verify-payment?reference=${response.reference}`)
        const data = await verificationResult.json()

        if (data.success && data.redirectUrl) {
          console.log("Redirecting to:", data.redirectUrl)
          window.location.href = data.redirectUrl
        } else {
          // Fallback to direct download page
          console.log("Using fallback redirection")
          window.location.href = `/download/${response.reference}?preferences=${form.getValues("recipePreferences").join(",")}`
        }
      } catch (error) {
        console.error("Error during payment verification:", error)
        // Fallback redirection
        window.location.href = `/download/${response.reference}?preferences=${form.getValues("recipePreferences").join(",")}`
      }
    },
    onClose: () => {
      setIsSubmitting(false)
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      if (!isReady) {
        throw new Error("Payment system is not ready")
      }

      // Validate required fields
      if (!values.email) throw new Error("Email is required")
      if (!values.parentFirstName) throw new Error("First name is required")
      if (!values.parentLastName) throw new Error("Last name is required")
      if (!values.phone) throw new Error("Phone number is required")

      // Generate a reference for this transaction
      const newReference = generatePaystackReference()
      setReference(newReference)

      // Join recipe preferences into a comma-separated string
      const preferencesString = values.recipePreferences.join(",")

      // Create order in database
      const orderResult = await createOrder({
        reference: newReference,
        email: values.email,
        firstName: values.parentFirstName,
        lastName: values.parentLastName,
        phone: values.phone,
        state: "", // Not used for infant recipe
        apartmentType: "infant-recipe", // Special type for infant recipe
        orderType: "download", // This is a download product
        deliveryAddress: "", // Not applicable for downloads
        landmark: preferencesString, // Store preferences in landmark field
        amount: SERVICE_CHARGE,
      })

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order")
      }

      // Add this inside the onSubmit function, right before initializing payment
      console.log("About to initialize Paystack payment with:", {
        email: values.email,
        amount: SERVICE_CHARGE,
        reference: newReference,
        firstName: values.parentFirstName,
        lastName: values.parentLastName,
        phone: values.phone,
        preferences: preferencesString,
      })

      // Initialize payment with minimal required parameters
      const paymentInitialized = initializePayment({
        email: values.email,
        amount: SERVICE_CHARGE,
        ref: newReference,
        firstname: values.parentFirstName,
        lastname: values.parentLastName,
        phone: values.phone,
        metadata: {
          custom_fields: [
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value: "download",
            },
            {
              display_name: "Apartment Type",
              variable_name: "apartment_type",
              value: "infant-recipe",
            },
            {
              display_name: "Preferences",
              variable_name: "preferences",
              value: preferencesString,
            },
          ],
        },
      })

      // Add this right after the initializePayment call
      if (!paymentInitialized) {
        console.error("Failed to initialize Paystack payment")
        throw new Error("Payment initialization failed. Please check your connection and try again.")
      }
    } catch (error) {
      console.error(error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          6-Month to 1-Year Infant Recipe Plan
          <br />
          <span className="underline text-red-900 dark:text-red-700">Purchased Plan</span>
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Parent Details Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Parent Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="parentFirstName"
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
                  name="parentLastName"
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
            </div>

            {/* Child Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Baby className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Child Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="childFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Child's first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="childLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Child's last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (in months)</FormLabel>
                      <FormControl>
                        <Input type="number" min="6" max="12" placeholder="Enter age in months" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hasAllergies"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Does your child have any allergies?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchHasAllergies === "yes" && (
                <FormField
                  control={form.control}
                  name="allergiesDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please indicate allergies</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please list all known allergies..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="recipePreferences"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Recipe Tailored Options</FormLabel>
                    </div>
                    <div className="space-y-2">
                      {recipePreferences.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="recipePreferences"
                          render={({ field }) => {
                            return (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(field.value?.filter((value) => value !== item.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 space-y-2 p-4 bg-primary/5 rounded-lg text-center">
              <p className="font-medium text-primary">50 carefully curated infant meals</p>
              <p className="text-muted-foreground">Recipes delivered instantly via email after payment</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Purchase Plan:</span>
                    <span className="text-lg font-semibold text-primary">{formatCurrency(SERVICE_CHARGE)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay Now ${formatCurrency(SERVICE_CHARGE)}`
              )}
            </Button>
          </form>
        </Form>
      </div>
      {isSubmitting && (
        <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-lg bg-green-50">
          <h3 className="text-lg font-medium mb-4 text-green-700">Payment Processing</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your payment is being processed. If you're not automatically redirected to the download page, you can use
            the button below:
          </p>
          <DirectDownloadButton reference={reference} preferences={form.getValues("recipePreferences") || []} />
        </div>
      )}
    </div>
  )
}

