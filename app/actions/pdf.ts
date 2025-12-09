"use server"

// This function returns the appropriate PDF URL based on apartment type
export async function getPdfUrl(apartmentType: string, orderType = "download", preferences = ""): Promise<string> {
  // In a real implementation, you would:
  // 1. Either generate the PDF dynamically based on the apartment type
  // 2. Or retrieve a pre-generated PDF from storage (Vercel Blob, S3, etc.)

  console.log("Getting PDF URL for:", { apartmentType, orderType, preferences })

  // For this example, we'll return static URLs based on apartment type
  const pdfUrls = {
    studio: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-pdf-studio.pdf",
    apartment: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-pdf-apartment.pdf",
    bungalow: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-pdf-bungalow.pdf",
    "duplex-terrace": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-pdf-duplex-terrace.pdf",
    "duplex-balcony": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-pdf-duplex-balcony.pdf",
  }

  // Handle infant recipe plans
  if (apartmentType === "infant-recipe") {
    // Log the preferences for debugging
    console.log("Processing infant recipe preferences:", preferences)

    // Use a publicly accessible sample PDF for testing
    // This ensures we always have a valid PDF URL to return
    const samplePdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

    try {
      // Handle empty preferences
      if (!preferences || preferences.trim() === "") {
        console.log("No preferences specified, using default PDF")
        return samplePdfUrl
      }

      const preferencesArray = preferences
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)
      console.log("Parsed preferences array:", preferencesArray)

      // For now, return the sample PDF regardless of preferences
      // In a production environment, you would return different PDFs based on preferences
      return samplePdfUrl
    } catch (error) {
      console.error("Error processing infant recipe preferences:", error)
      return samplePdfUrl
    }
  }

  // Return the URL for the specified apartment type, or a default if not found
  // Fallback to a known working PDF if the specific one isn't available
  return (
    pdfUrls[apartmentType as keyof typeof pdfUrls] ||
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  )
}

