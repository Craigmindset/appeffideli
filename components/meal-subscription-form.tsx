"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { usePaystack } from "@/hooks/use-paystack"
import { generatePaystackReference } from "@/lib/paystack"
import { createOrder } from "@/app/actions/payment"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

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

// Format number to Nigerian Naira
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Meal plan pricing
const MEAL_PLAN_PRICES = {
  general: 25000,
  healthy: 35000,
  both: 50000,
}

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  state: z.string({
    required_error: "Please select a state",
  }),
  mealPlanType: z.enum(["general", "healthy", "both"], {
    required_error: "Please select a meal plan type",
  }),
})

type MealSubscriptionFormProps = {
  onBack: () => void
}

export default function MealSubscriptionForm({ onBack }: MealSubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reference, setReference] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      state: "",
      mealPlanType: "general",
    },
  })

  const watchMealPlanType = form.watch("mealPlanType")
  const currentPrice = MEAL_PLAN_PRICES[watchMealPlanType as keyof typeof MEAL_PLAN_PRICES]

  // Initialize Paystack
  const { isReady, isLoading, error, initializePayment } = usePaystack({
    email: form.getValues("email"),
    firstName: form.getValues("firstName"),
    lastName: form.getValues("lastName"),
    phone: form.getValues("phone"),
    apartmentType: "apartment", // Default value for meal subscription
    orderType: "subscription", // Changed to subscription type
    reference: reference, // Use the stored reference
    onSuccess: async (response) => {
      // Show loading state
      setIsSubmitting(true)
      toast({
        title: "Payment Successful",
        description: "Processing your subscription...",
      })

      try {
        // Handle the subscription payment and get access token
        const result = await fetch(
          `/api/subscription/process?email=${form.getValues("email")}&reference=${response.reference}`,
        )
        const data = await result.json()

        if (data.success) {
          // Redirect to dashboard with token
          router.push(`/subscription/dashboard?token=${data.token}`)
        } else {
          // If there was an error, redirect to the subscription page with email and reference
          router.push(`/subscription?email=${form.getValues("email")}&reference=${response.reference}`)
        }
      } catch (error) {
        console.error("Error processing subscription:", error)
        // Fallback redirect
        router.push(`/subscription?email=${form.getValues("email")}&reference=${response.reference}`)
      }
    },
    onClose: () => {
      // Handle payment modal close
      toast({
        title: "Payment Cancelled",
        description: "You have cancelled the payment process.",
        variant: "destructive",
      })
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      if (!isReady) {
        throw new Error("Payment system is not ready")
      }

      // Generate a reference for this transaction
      const newReference = generatePaystackReference()
      setReference(newReference)

      // Create order in database
      const orderResult = await createOrder({
        reference: newReference,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        state: values.state,
        apartmentType: "apartment", // Default for meal subscription
        orderType: "subscription", // Order type for subscriptions
        deliveryAddress: "", // Not applicable for subscriptions
        landmark: values.mealPlanType, // Store meal plan type in landmark field
        amount: MEAL_PLAN_PRICES[values.mealPlanType as keyof typeof MEAL_PLAN_PRICES],
      })

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order")
      }

      // Initialize payment
      initializePayment()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Monthly Home Meal Subscription
          <br />
          <span className="underline text-red-900 dark:text-red-700">Purchased Plan</span>
        </h2>

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
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mealPlanType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    Meal Plan Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="general" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          General Meal Plan ({formatCurrency(MEAL_PLAN_PRICES.general)})
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="healthy" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Healthy Meal Plan ({formatCurrency(MEAL_PLAN_PRICES.healthy)})
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="both" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Both Plans ({formatCurrency(MEAL_PLAN_PRICES.both)})
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Purchase Plan:</span>
                    <span className="text-lg font-semibold text-primary">{formatCurrency(currentPrice)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Subscription:</span>
                      <span>1 Month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan Type:</span>
                      <span>
                        {watchMealPlanType === "general" && "General Meal Plan"}
                        {watchMealPlanType === "healthy" && "Healthy Meal Plan"}
                        {watchMealPlanType === "both" && "Both Plans"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <p className="text-center text-muted-foreground">
                Subscribe and receive a new meal plan every Friday at 9 PM.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? "Processing..." : "Subscribe Now"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

