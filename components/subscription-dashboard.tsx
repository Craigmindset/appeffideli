"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { downloadWeeklyPlan, submitFeedback } from "@/app/actions/subscription"
import { Loader2, Check, Download, Lock, LogOut } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Week {
  week: number
  available: boolean
  downloaded: boolean
  accessDate: string
}

interface SubscriptionDashboardProps {
  token: string
  email: string
  weeks: Week[]
  images: string[]
  allDownloaded: boolean
  subscriptionStatus: string
  subscriptionEndDate: string
}

export function SubscriptionDashboard({
  token,
  email,
  weeks,
  images,
  allDownloaded,
  subscriptionStatus,
  subscriptionEndDate,
}: SubscriptionDashboardProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const router = useRouter()

  async function handleDownload(week: number) {
    setLoading(week)
    try {
      const result = await downloadWeeklyPlan(token, week)
      if (result.success) {
        // Create a temporary link and trigger download
        const link = document.createElement("a")
        link.href = result.pdfUrl
        link.setAttribute("download", `Week-${week}-Meal-Plan.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Show success message
        toast({
          title: "Download started",
          description: `Week ${week} meal plan is downloading.`,
        })

        // Refresh the page to update download status
        window.location.reload()
      } else {
        toast({
          variant: "destructive",
          title: "Download failed",
          description: result.error || "Failed to download meal plan.",
        })
      }
    } catch (error) {
      console.error("Download error:", error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "An unexpected error occurred.",
      })
    } finally {
      setLoading(null)
    }
  }

  async function handleFeedbackSubmit() {
    if (!feedback.trim()) return

    setSubmittingFeedback(true)
    try {
      const result = await submitFeedback(token, feedback)
      if (result.success) {
        toast({
          title: "Feedback submitted",
          description: "Thank you for your feedback!",
        })
        setShowFeedback(false)
        setFeedback("")
      } else {
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: result.error || "Failed to submit feedback.",
        })
      }
    } catch (error) {
      console.error("Feedback error:", error)
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "An unexpected error occurred.",
      })
    } finally {
      setSubmittingFeedback(false)
    }
  }

  function handleLogout() {
    // Redirect to login page
    router.push("/subscription/login")
  }

  function formatAccessDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()

    // Reset time part for accurate day comparison
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Calculate days difference
    const diffTime = dateWithoutTime.getTime() - todayWithoutTime.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return "Available now"
    } else if (diffDays === 0) {
      return "Available today"
    } else if (diffDays === 1) {
      return "Available tomorrow"
    } else if (diffDays < 7) {
      return `Available in ${diffDays} days`
    } else {
      return `Available from ${date.toLocaleDateString()}`
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with user info and logout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Meal Plan Subscription</h2>
          <p className="text-muted-foreground">Logged in as: {email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {weeks.map((week, index) => (
          <Card key={week.week} className={!week.available ? "opacity-70" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Week {week.week}
                {week.downloaded && <Check className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                <Image
                  src={images[index] || "/placeholder.svg"}
                  alt={`Week ${week.week} preview`}
                  fill
                  className="object-cover"
                />
                {!week.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Lock className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm">
                <p className="text-muted-foreground">
                  {week.available ? "Available now" : formatAccessDate(week.accessDate)}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleDownload(week.week)}
                disabled={!week.available || loading === week.week}
              >
                {loading === week.week ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {week.downloaded ? "Download Again" : "Download"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {allDownloaded && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Your Meal Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You've downloaded all available meal plans. We'd love to hear your feedback!</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowFeedback(true)}>Leave Feedback</Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>We'd love to hear about your experience with our meal plans.</DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Tell us what you think..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedback(false)}>
              Cancel
            </Button>
            <Button onClick={handleFeedbackSubmit} disabled={!feedback.trim() || submittingFeedback}>
              {submittingFeedback ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {subscriptionStatus !== "active" && (
        <div className="text-center">
          <p className="text-lg font-medium">
            Your subscription is {subscriptionStatus}. It ends on {subscriptionEndDate}.
          </p>
        </div>
      )}
    </div>
  )
}

