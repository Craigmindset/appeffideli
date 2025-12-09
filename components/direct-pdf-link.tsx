"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2 } from "lucide-react"

interface DirectPdfLinkProps {
  reference: string
  preferences?: string
}

export function DirectPdfLink({ reference, preferences = "" }: DirectPdfLinkProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/download-pdf?reference=${reference}&preferences=${preferences}`)
        const data = await response.json()

        if (data.success && data.pdfUrl) {
          setPdfUrl(data.pdfUrl)
        } else if (data.fallbackUrl) {
          setPdfUrl(data.fallbackUrl)
          setError("Using fallback PDF. Please contact support for assistance.")
        } else {
          setError(data.error || "Failed to get PDF URL")
        }
      } catch (error) {
        console.error("Error fetching PDF URL:", error)
        setError("An unexpected error occurred")
        // Use a fallback PDF
        setPdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfUrl()
  }, [reference, preferences])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading PDF link...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2">{error}</p>
        {pdfUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Try Fallback PDF <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">PDF link not available</p>
      </div>
    )
  }

  return (
    <div className="text-center py-4">
      <Button asChild variant="outline">
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          Open PDF in Browser <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        If the download button doesn't work, use this link to open the PDF directly
      </p>
    </div>
  )
}

