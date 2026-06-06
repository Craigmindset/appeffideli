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
import { useRouter } from "next/navigation";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

interface DownloadItem {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
  downloadUrl: string;
}

export default function MyDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/my-downloads", {
          cache: "no-store",
        });

        if (!response.ok) {
          setDownloads([]);
          return;
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.downloads)) {
          setDownloads(data.downloads);
        } else {
          setDownloads([]);
        }
      } catch (error) {
        console.error("Failed to fetch downloads:", error);
        setDownloads([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const handleDownload = (item: DownloadItem) => {
    router.push(item.downloadUrl);
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
            {isLoading
              ? "Loading your purchased downloads..."
              : `${downloads.length} item${downloads.length !== 1 ? "s" : ""} in your download history`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoading && downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                You have no active download
              </h3>
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
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-primary">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="uppercase text-xs font-medium">PDF</span>
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
