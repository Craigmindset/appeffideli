"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}: PdfViewerModalProps) {
  const [viewerUrl, setViewerUrl] = useState("");
  const [embedSupported, setEmbedSupported] = useState(true);

  useEffect(() => {
    if (fileUrl) {
      // Transform Cloudinary URL for proper PDF viewing
      let transformedUrl = fileUrl;

      // If it's a raw resource PDF, we need to handle it specially
      if (fileUrl.includes("/raw/upload/") && fileName.endsWith(".pdf")) {
        // For full PDF viewing, we need to use a different approach
        // Option 1: Keep as raw for download
        // Option 2: Use PDF.js or similar viewer
        // Option 3: Use Google Docs Viewer as fallback
        transformedUrl = fileUrl;
      }

      setViewerUrl(transformedUrl);
    }
  }, [fileUrl, fileName]);

  const handleDownload = () => {
    const downloadUrl = fileUrl.replace(/\/upload\//, "/upload/fl_attachment/");
    window.open(downloadUrl, "_blank");
  };

  const handleOpenNewTab = () => {
    window.open(fileUrl, "_blank");
  };

  // Check if browser supports PDF embed
  useEffect(() => {
    // Most modern browsers support PDF embed, but mobile browsers might not
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );

    if (isMobile) {
      setEmbedSupported(false);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {fileName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenNewTab}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
          {embedSupported ? (
            <embed
              src={viewerUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                PDF preview is not supported on your device.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOpenNewTab}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  viewerUrl
                )}&embedded=true`}
                width="100%"
                height="100%"
                className="border-0 mt-4"
                title="PDF Viewer"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
