"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/app/actions/orders"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OrderActionsProps {
  orderId: string
  currentStatus: "pending" | "success" | "failed"
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleStatusUpdate = async (newStatus: "success" | "failed") => {
    if (status === newStatus) return

    setIsUpdating(true)
    setError(null)

    try {
      const result = await updateOrderStatus(orderId, newStatus)

      if (result.success) {
        setStatus(newStatus)
        toast({
          title: "Status updated",
          description: `Order status has been updated to ${newStatus}`,
        })
        router.refresh()
      } else {
        setError(result.error || "Failed to update status")
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={status === "success" ? "default" : "outline"}
          className={status === "success" ? "bg-green-600 hover:bg-green-700" : ""}
          disabled={status === "success" || isUpdating}
          onClick={() => handleStatusUpdate("success")}
        >
          {isUpdating && status !== "success" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Mark as Success
        </Button>
        <Button
          type="button"
          variant={status === "failed" ? "default" : "outline"}
          className={status === "failed" ? "bg-red-600 hover:bg-red-700" : ""}
          disabled={status === "failed" || isUpdating}
          onClick={() => handleStatusUpdate("failed")}
        >
          {isUpdating && status !== "failed" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Mark as Failed
        </Button>
      </div>
    </div>
  )
}

