"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UploadCardProps {
  title: string;
  description: string;
  category: string;
}

function UploadCard({ title, description, category }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createBrowserSupabaseClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      // Upload file to Supabase Storage
      const fileName = `${category}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName);

      // Save metadata to database
      const { error: dbError } = await supabase.from("admin_uploads").insert({
        category,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by: user.id,
      });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
      });

      setFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        `file-${category}`
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`file-${category}`} className="dark:text-gray-200">
            Select Document
          </Label>
          <Input
            id={`file-${category}`}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {file && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function UploadsPage() {
  const uploadCards = [
    {
      title: "Infant Recipe",
      description: "Upload infant recipe guides and nutrition plans",
      category: "infant_recipe",
    },
    {
      title: "Meal Plan",
      description: "Upload weekly and monthly meal planning documents",
      category: "meal_plan",
    },
    {
      title: "Nutrition Guide",
      description: "Upload nutrition guides for toddlers and children",
      category: "nutrition_guide",
    },
    {
      title: "Health Plan",
      description: "Upload health and nutrition plan documents",
      category: "health_plan",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Document Uploads
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          Upload and manage documents for users to download
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {uploadCards.map((card) => (
          <UploadCard
            key={card.category}
            title={card.title}
            description={card.description}
            category={card.category}
          />
        ))}
      </div>
    </div>
  );
}
