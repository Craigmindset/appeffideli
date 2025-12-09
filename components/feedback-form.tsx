"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { submitFeedback } from "@/app/actions/subscription"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { DialogFooter } from "@/components/ui/dialog"

const formSchema = z.object({
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
})

type FormValues = z.infer<typeof formSchema>

interface FeedbackFormProps {
  email: string
  onComplete: () => void
}

export function FeedbackForm({ email, onComplete }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const result = await submitFeedback(email, data.feedback)

      if (result.success) {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully.",
        })
        onComplete()
      } else {
        toast({
          title: "Submission failed",
          description: result.message || "Failed to submit your feedback.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what you thought about the meal plans..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onComplete}>
            Skip
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

