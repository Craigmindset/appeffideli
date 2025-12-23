"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface DownloadItem {
  id: string;
  title: string;
  type: string;
  downloadedAt: string;
  fileSize: string;
  downloadUrl: string;
}

export default function MyDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockDownloads: DownloadItem[] = [
      {
        id: "1",
        title: "Infant Recipe Guide",
        type: "PDF",
        downloadedAt: "2024-12-20",
        fileSize: "2.4 MB",
        downloadUrl: "#",
      },
      {
        id: "2",
        title: "Weekly Meal Plan - December",
        type: "PDF",
        downloadedAt: "2024-12-18",
        fileSize: "1.8 MB",
        downloadUrl: "#",
      },
      {
        id: "3",
        title: "Nutrition Guide for Toddlers",
        type: "PDF",
        downloadedAt: "2024-12-15",
        fileSize: "3.1 MB",
        downloadUrl: "#",
      },
      {
        id: "4",
        title: "Healthy Snacks Ideas",
        type: "PDF",
        downloadedAt: "2024-12-10",
        fileSize: "1.5 MB",
        downloadUrl: "#",
      },
    ];

    setDownloads(mockDownloads);
  }, []);

  const handleDownload = (item: DownloadItem) => {
    // Implement download logic
    console.log("Downloading:", item.title);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Downloads</h1>
        <p className="text-muted-foreground mt-2">
          Access all your downloaded PDFs and resources
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Download History</CardTitle>
          <CardDescription>
            {downloads.length} item{downloads.length !== 1 ? "s" : ""} in your
            download history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No downloads yet</h3>
              <p className="text-muted-foreground">
                Your downloaded files will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {downloads.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.downloadedAt).toLocaleDateString()}
                          </span>
                          <span>{item.fileSize}</span>
                          <span className="uppercase text-xs font-medium">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="md:ml-auto">
                      <Button
                        onClick={() => handleDownload(item)}
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Again
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
