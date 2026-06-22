import { supabaseAdmin } from "@/lib/supabase";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DownloadButtonEnhanced from "@/components/download-button-enhanced";
import HouseholdDownloadClient from "@/components/household-download-client";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

type DownloadFile = {
  type: "pdf" | "audio";
  url: string;
  fileName: string;
};

export default async function DownloadPage({
  params,
  searchParams,
}: {
  params: { reference: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const reference = params.reference;

  // Fetch order details to verify payment and get apartment type
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .eq("status", "success") // Only allow downloads for successful payments
    .eq("order_type", "download") // Only for download orders
    .single();

  // If order not found or not successful, show error
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-10">
          <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Download Unavailable
            </h1>
            <p className="text-center mb-6">
              We couldn't find a valid download for this reference. This could
              be because:
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
    );
  }

  const preferences =
    typeof searchParams.preferences === "string"
      ? searchParams.preferences
      : order.landmark || "";

  const isInfantRecipe = order.apartment_type === "infant-recipe";

  // For household purchases, fetch files from price_rate_household table
  if (!isInfantRecipe) {
    const { data: priceRate } = await supabaseAdmin
      .from("price_rate_household")
      .select("pdf_file, audio_file, home_type")
      .eq("apartment_type", order.apartment_type)
      .maybeSingle();

    if (!priceRate) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container py-10">
            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-6 text-center">
                Download Unavailable
              </h1>
              <p className="text-center mb-6">
                We couldn't find the files for your purchase. Please contact support.
              </p>
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
      );
    }

    // Determine which files to download based on landmark field
    const downloadFiles: DownloadFile[] = [];
    const landmark = order.landmark || "";

    if (
      landmark === "download-pdf-only" ||
      landmark === "download-pdf-and-audio"
    ) {
      if (priceRate.pdf_file) {
        downloadFiles.push({
          type: "pdf",
          url: priceRate.pdf_file,
          fileName: `Effideli-${order.apartment_type}-Routine.pdf`,
        });
      }
    }

    if (
      landmark === "download-audio-only" ||
      landmark === "download-pdf-and-audio"
    ) {
      if (priceRate.audio_file) {
        downloadFiles.push({
          type: "audio",
          url: priceRate.audio_file,
          fileName: `Effideli-${order.apartment_type}-Routine-Audio.mp3`,
        });
      }
    }

    // If no files found, show error
    if (downloadFiles.length === 0) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container py-10">
            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-6 text-center">
                Download Unavailable
              </h1>
              <p className="text-center mb-6">
                The requested files are not available yet. Please contact support.
              </p>
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
      );
    }

    // Render household download client
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <HouseholdDownloadClient
          orderReference={order.reference}
          apartmentType={order.apartment_type}
          orderDate={new Date(order.created_at).toLocaleDateString()}
          files={downloadFiles}
          autoDownload={true}
        />
        <Footer />
      </div>
    );
  }

  // Infant recipe logic (existing code)
  const secureDownloadUrl = `/api/download-pdf?reference=${encodeURIComponent(reference)}&preferences=${encodeURIComponent(preferences)}`;

  // Log the PDF URL and order details for debugging
  console.log("Download details:", {
    apartmentType: order.apartment_type,
    orderType: "download",
    preferences,
    secureDownloadUrl,
  });

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
            Your Infant Recipe Plan is Ready!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Thank you for your purchase. Your 6-Month to 1-Year Infant Recipe Plan is ready to download.
          </p>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="font-semibold mb-2">Recipe Plan Details:</h2>
            <p>
              <span className="font-medium">Reference:</span>{" "}
              {order.reference}
            </p>
            <p>
              <span className="font-medium">Preferences:</span>{" "}
              {preferences
                .split(",")
                .map((p) => {
                  const labels: Record<string, string> = {
                    allergies: "Allergies Conscious",
                    sweet: "Sweet Tooth Preferences",
                    nutrition: "Nutrition Goals",
                  };
                  return labels[p] || p;
                })
                .join(", ")}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex justify-center">
            <DownloadButtonEnhanced
              pdfUrl={secureDownloadUrl}
              fileName={`Effideli-Infant-Recipe-Plan.pdf`}
              autoDownload={true}
              showStatus={true}
            />
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Having trouble? Contact our support at support@effideli.com</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
