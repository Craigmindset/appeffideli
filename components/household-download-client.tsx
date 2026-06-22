"use client";

import { useEffect, useState } from "react";
import { CheckCircle, FileText, Volume2, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type DownloadFile = {
  type: "pdf" | "audio";
  url: string;
  fileName: string;
};

type HouseholdDownloadClientProps = {
  orderReference: string;
  apartmentType: string;
  orderDate: string;
  files: DownloadFile[];
  autoDownload?: boolean;
};

export default function HouseholdDownloadClient({
  orderReference,
  apartmentType,
  orderDate,
  files,
  autoDownload = true,
}: HouseholdDownloadClientProps) {
  const [downloadStatus, setDownloadStatus] = useState<Record<string, "pending" | "downloading" | "complete">>({});
  const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);

  useEffect(() => {
    if (autoDownload && !hasAutoDownloaded && files.length > 0) {
      setHasAutoDownloaded(true);
      // Auto-download all files after a short delay
      const timer = setTimeout(() => {
        files.forEach((file) => {
          handleDownload(file);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, hasAutoDownloaded, files]);

  const handleDownload = async (file: DownloadFile) => {
    const fileId = `${file.type}-${file.url}`;
    setDownloadStatus((prev) => ({ ...prev, [fileId]: "downloading" }));

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      // For external URLs (like Supabase storage), we might need to fetch and create a blob
      if (file.url.startsWith("http")) {
        try {
          const response = await fetch(file.url);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          link.href = blobUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL after a delay
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (fetchError) {
          // Fallback to direct link if fetch fails
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadStatus((prev) => ({ ...prev, [fileId]: "complete" }));
    } catch (error) {
      console.error("Download error:", error);
      setDownloadStatus((prev) => ({ ...prev, [fileId]: "pending" }));
      alert(`Failed to download ${file.fileName}. Please try again.`);
    }
  };

  const getFileIcon = (type: string) => {
    return type === "pdf" ? <FileText className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />;
  };

  const getFileLabel = (type: string) => {
    return type === "pdf" ? "PDF (Printable)" : "Audio Version";
  };

  const getDownloadButtonText = (file: DownloadFile) => {
    const fileId = `${file.type}-${file.url}`;
    const status = downloadStatus[fileId] || "pending";
    
    if (status === "downloading") return "Downloading...";
    if (status === "complete") return "Download Again";
    return `Download ${getFileLabel(file.type)}`;
  };

  const getDownloadButtonIcon = (file: DownloadFile) => {
    const fileId = `${file.type}-${file.url}`;
    const status = downloadStatus[fileId] || "pending";
    
    if (status === "downloading") return <Loader2 className="h-4 w-4 animate-spin" />;
    if (status === "complete") return <CheckCircle className="h-4 w-4" />;
    return <Download className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container py-10">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">
            Your Download is Ready!
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Thank you for your purchase. Your Household Cleaning Routine is ready to download.
          </p>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h2 className="font-semibold mb-2">Order Details:</h2>
            <p>
              <span className="font-medium">Reference:</span> {orderReference}
            </p>
            <p>
              <span className="font-medium">Home Type:</span>{" "}
              {apartmentType
                .replace(/-/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </p>
            <p>
              <span className="font-medium">Date:</span> {orderDate}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {files.map((file, index) => {
              const fileId = `${file.type}-${file.url}`;
              const status = downloadStatus[fileId] || "pending";
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {getFileLabel(file.type)}
                      </p>
                      <p className="text-xs text-gray-500">{file.fileName}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(file)}
                    disabled={status === "downloading"}
                    size="sm"
                    className="gap-2"
                  >
                    {getDownloadButtonIcon(file)}
                    <span className="hidden sm:inline">
                      {getDownloadButtonText(file)}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>

          {autoDownload && files.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800 text-center">
                ✓ Your download{files.length > 1 ? "s have" : " has"} started automatically. 
                If {files.length > 1 ? "they don't" : "it doesn't"} start, click the download button{files.length > 1 ? "s" : ""} above.
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Having trouble? Contact our support at support@effideli.com</p>
          </div>
        </div>
      </main>
    </div>
  );
}
