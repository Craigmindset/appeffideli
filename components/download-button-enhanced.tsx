"use client"

import { useState, useEffect } from "react"
import { Download, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DownloadButtonEnhancedProps {
  pdfUrl: string
  fileName: string
  autoDownload?: boolean
  showStatus?: boolean
}

export default function DownloadButtonEnhanced({
  pdfUrl,
  fileName,
  autoDownload = true,
  showStatus = true,
}: DownloadButtonEnhancedProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [hasDownloaded, setHasDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-download when the component mounts
  useEffect(() => {
    if (autoDownload) {
      // Add a small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        handleDownload()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [autoDownload])

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    setError(null)

    try {
      console.log("Starting download from URL:", pdfUrl)

      // Validate the URL
      if (!pdfUrl || !pdfUrl.startsWith("http")) {
        throw new Error("Invalid PDF URL")
      }

      // Fetch the PDF file with error handling
      try {
        const response = await fetch(pdfUrl, {
          method: "GET",
          mode: "cors", // Try with cors mode
          cache: "no-cache",
          headers: {
            Accept: "application/pdf",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
        }

        const blob = await response.blob()

        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()

        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setHasDownloaded(true)
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)

        // Fallback: Try opening the PDF in a new tab
        window.open(pdfUrl, "_blank")
        setHasDownloaded(true)

        // Show a helpful message
        setError(
          "Direct download failed, but we've opened the PDF in a new tab. If it doesn't open, please check your popup blocker.",
        )
      }
    } catch (error) {
      console.error("Download failed:", error)
      setError(error instanceof Error ? error.message : "Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`inline-flex items-center px-6 py-3 rounded-md text-white font-medium ${
          hasDownloaded ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
        } transition-colors ${isDownloading ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Downloading...
          </>
        ) : hasDownloaded ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Download Again
          </>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </>
        )}
      </Button>

      {showStatus && (
        <>
          {hasDownloaded && !error && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Download complete! If your download didn't start automatically, click the button above to try again.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}

