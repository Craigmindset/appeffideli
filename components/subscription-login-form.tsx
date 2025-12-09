"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getSubscriptionByEmail } from "@/app/actions/subscription"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export function SubscriptionLoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const result = await getSubscriptionByEmail(values.email)

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Redirecting to your subscription dashboard",
        })

        // Redirect to dashboard with token
        router.push(`/subscription/dashboard?token=${result.token}`)
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error || "No active subscription found for this email",
        })
      }
    } catch (error) {
      console.error("Error logging in:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Access Subscription"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

