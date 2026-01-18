"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdvancedPdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export function AdvancedPdfViewer({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}: AdvancedPdfViewerProps) {
  const [viewerUrl, setViewerUrl] = useState("");
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<"embed" | "google">("embed");

  useEffect(() => {
    if (fileUrl) {
      setViewerUrl(fileUrl);
    }
  }, [fileUrl]);

  const handleDownload = () => {
    const downloadUrl = fileUrl.replace(/\/upload\//, "/upload/fl_attachment/");
    window.open(downloadUrl, "_blank");
  };

  const handleOpenNewTab = () => {
    window.open(fileUrl, "_blank");
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-3 border-b bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate flex-1 mr-4">
              {fileName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-7 w-7 p-0"
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs px-2 min-w-[4rem] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-7 w-7 p-0"
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2 h-8"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenNewTab}
                className="gap-2 h-8"
              >
                <ExternalLink className="h-4 w-4" />
                New Tab
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

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as any)}
          className="flex-1 flex flex-col"
        >
          <div className="px-6 py-2 border-b bg-gray-50 dark:bg-gray-800">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="embed">Native Viewer</TabsTrigger>
              <TabsTrigger value="google">Google Docs Viewer</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="embed" className="flex-1 m-0 p-0 overflow-hidden">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <div
                className="bg-white dark:bg-gray-800 shadow-lg"
                style={{
                  width: `${zoom}%`,
                  height: `${zoom}%`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  overflow: "auto",
                }}
              >
                <embed
                  src={`${viewerUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  className="w-full h-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="google"
            className="flex-1 m-0 p-0 overflow-hidden"
          >
            <div className="w-full h-full bg-gray-100 dark:bg-gray-900">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  viewerUrl
                )}&embedded=true`}
                width="100%"
                height="100%"
                className="border-0"
                title="PDF Viewer"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer with page info */}
        <div className="px-6 py-2 border-t bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
          <div>
            Tip: Use your browser's PDF controls for navigation and printing
          </div>
          <div className="text-xs">
            {fileUrl.match(/\/raw\/upload\//) ? "Raw" : "Image"} resource
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
