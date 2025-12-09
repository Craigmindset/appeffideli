import { supabaseAdmin } from "@/lib/supabase"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { getPdfUrl } from "@/app/actions/pdf"
import DownloadButtonEnhanced from "@/components/download-button-enhanced"
import { DirectPdfLink } from "@/components/direct-pdf-link"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DownloadPage({
  params,
  searchParams,
}: {
  params: { reference: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const reference = params.reference

  // Fetch order details to verify payment and get apartment type
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .eq("status", "success") // Only allow downloads for successful payments
    .eq("order_type", "download") // Only for download orders
    .single()

  // If order not found or not successful, show error
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-10">
          <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Download Unavailable</h1>
            <p className="text-center mb-6">
              We couldn't find a valid download for this reference. This could be because:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>The payment was not successful</li>
              <li>The order was not for a downloadable product</li>
              <li>The reference number is incorrect</li>
            </ul>
            <div className="flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Get the PDF URL based on apartment type and order details
  const preferences = typeof searchParams.preferences === "string" ? searchParams.preferences : order.landmark || ""

  // Get PDF URL with error handling
  let pdfUrl
  try {
    pdfUrl = await getPdfUrl(order.apartment_type, "download", preferences)
  } catch (pdfError) {
    console.error("Error getting PDF URL:", pdfError)
    // Fallback to a known working PDF
    pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }

  // Log the PDF URL and order details for debugging
  console.log("Download details:", {
    apartmentType: order.apartment_type,
    orderType: "download",
    preferences,
    pdfUrl,
  })

  const isInfantRecipe = order.apartment_type === "infant-recipe"

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container py-10">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">
            {isInfantRecipe ? "Your Infant Recipe Plan is Ready!" : "Your Download is Ready!"}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {isInfantRecipe
              ? "Thank you for your purchase. Your 6-Month to 1-Year Infant Recipe Plan is ready to download."
              : "Thank you for your purchase. Your Household Chore Routine Management PDF is ready to download."}
          </p>

          {isInfantRecipe ? (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="font-semibold mb-2">Recipe Plan Details:</h2>
              <p>
                <span className="font-medium">Reference:</span> {order.reference}
              </p>
              <p>
                <span className="font-medium">Preferences:</span>{" "}
                {preferences
                  .split(",")
                  .map((pref) =>
                    pref === "allergies"
                      ? "Allergies Conscious"
                      : pref === "sweet"
                        ? "Sweet Tooth Preferences"
                        : pref === "nutrition"
                          ? "Nutrition Goals"
                          : pref,
                  )
                  .join(", ")}
              </p>
              <p>
                <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="font-semibold mb-2">Order Details:</h2>
              <p>
                <span className="font-medium">Reference:</span> {order.reference}
              </p>
              <p>
                <span className="font-medium">Home Type:</span>{" "}
                {order.apartment_type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <p>
                <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <DownloadButtonEnhanced
              pdfUrl={pdfUrl}
              fileName={
                isInfantRecipe ? `Effideli-Infant-Recipe-Plan.pdf` : `Effideli-${order.apartment_type}-Routine.pdf`
              }
              autoDownload={true}
              showStatus={true}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">If the download button doesn't work, you can also:</p>
            <DirectPdfLink reference={reference} preferences={preferences} />
          </div>

          {/* Add direct PDF link as fallback */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">If the download button doesn't work, you can also:</p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Open PDF directly in browser
            </a>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Having trouble? Contact our support at support@effideli.com</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

