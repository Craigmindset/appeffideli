"use client"

import { useToast } from "./use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`p-4 rounded-md shadow-lg flex items-start justify-between ${
            toast.variant === "destructive" ? "bg-destructive text-destructive-foreground" : "bg-background border"
          }`}
          role="alert"
        >
          <div>
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
          </div>
          <button
            onClick={() => dismiss(toast)}
            className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  )
}

