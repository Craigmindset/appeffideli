"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  pdfUrl: string
  fileName: string
}

export default function DownloadButton({ pdfUrl, fileName }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [hasDownloaded, setHasDownloaded] = useState(false)

  // Auto-download when the component mounts
  useEffect(() => {
    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      handleDownload()
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = async () => {
    if (isDownloading || hasDownloaded) return

    setIsDownloading(true)

    try {
      // Fetch the PDF file
      const response = await fetch(pdfUrl)
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
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`inline-flex items-center px-6 py-3 rounded-md text-white font-medium ${
        hasDownloaded ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
      } transition-colors ${isDownloading ? "opacity-75 cursor-not-allowed" : ""}`}
    >
      <Download className="mr-2 h-5 w-5" />
      {isDownloading ? "Downloading..." : hasDownloaded ? "Download Again" : "Download PDF"}
    </button>
  )
}

