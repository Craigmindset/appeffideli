"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download } from "lucide-react"

interface DirectDownloadButtonProps {
  reference: string
  preferences: string[]
}

export function DirectDownloadButton({ reference, preferences }: DirectDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDirectDownload = () => {
    setIsLoading(true)

    // Construct the download URL with preferences
    const preferencesParam = preferences.length > 0 ? `?preferences=${preferences.join(",")}` : ""
    const downloadUrl = `/download/${reference}${preferencesParam}`

    console.log("Redirecting to download page:", downloadUrl)

    // Redirect to the download page
    window.location.href = downloadUrl
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleDirectDownload} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Your Recipe Plan
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500">Click this button to download your Infant Recipe Plan directly.</div>
    </div>
  )
}

