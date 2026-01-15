"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Upload {
  id: string;
  category: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

export default function MyDownloadPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("admin_uploads")
        .select("id, category, file_name, file_url, file_size, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error("Error fetching uploads:", error);
      toast({
        title: "Error",
        description: "Failed to load uploads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleDownload = async (upload: Upload) => {
    try {
      // Add download flag for PDFs and documents
      let downloadUrl = upload.file_url;
      if (
        upload.file_name.endsWith(".pdf") ||
        upload.file_name.endsWith(".doc") ||
        upload.file_name.endsWith(".docx")
      ) {
        // Add fl_attachment flag to force download
        downloadUrl = downloadUrl.replace(
          /\/upload\//,
          "/upload/fl_attachment/"
        );
      }
      // Open/download the file
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async (upload: Upload) => {
    try {
      // Open the file URL in a new tab for preview (without attachment flag)
      window.open(upload.file_url, "_blank");
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Error",
        description: "Failed to preview file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          My Downloads
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          View all uploaded documents
        </p>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Uploaded Documents</CardTitle>
          <CardDescription className="dark:text-gray-400">
            All files uploaded to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border dark:border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700 dark:bg-gray-700/50">
                  <TableHead className="dark:text-gray-200">
                    File Name
                  </TableHead>
                  <TableHead className="dark:text-gray-200">Category</TableHead>
                  <TableHead className="dark:text-gray-200">Size</TableHead>
                  <TableHead className="dark:text-gray-200">
                    Upload Date
                  </TableHead>
                  <TableHead className="dark:text-gray-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 dark:text-gray-400"
                    >
                      Loading uploads...
                    </TableCell>
                  </TableRow>
                ) : uploads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 dark:text-gray-400"
                    >
                      No uploads found
                    </TableCell>
                  </TableRow>
                ) : (
                  uploads.map((upload) => (
                    <TableRow
                      key={upload.id}
                      className="dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                      <TableCell className="font-medium dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {upload.file_name}
                        </div>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {formatCategory(upload.category)}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatFileSize(upload.file_size)}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {formatDate(upload.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(upload)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(upload)}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
