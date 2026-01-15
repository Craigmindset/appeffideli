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
import { UploadSuccessModal } from "@/components/upload-success-modal";
import { UploadErrorModal } from "@/components/upload-error-modal";

interface UploadCardProps {
  title: string;
  description: string;
  category: string;
}

function UploadCard({ title, description, category }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successFileName, setSuccessFileName] = useState("");
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

    // Check file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: `File size (${(file.size / 1024 / 1024).toFixed(
          2
        )}MB) exceeds the 10MB limit`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log("Starting direct upload to Cloudinary:", {
        name: file.name,
        size: file.size,
        type: file.type,
        category,
      });

      // Step 1: Get signature from our API
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: category }),
      });

      if (!signatureResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, cloudName, apiKey, folder } =
        await signatureResponse.json();

      // Determine resource type based on file type
      // PDFs and documents should use 'raw', images use 'image'
      const isPDF =
        file.type === "application/pdf" || file.name.endsWith(".pdf");
      const resourceType =
        file.type.startsWith("image/") && !isPDF ? "image" : "raw";

      // Create public_id with filename (important for PDFs to have proper extension)
      const fileNameWithoutExt = file.name.substring(
        0,
        file.name.lastIndexOf(".")
      );
      const fileExt = file.name.substring(file.name.lastIndexOf("."));
      const publicId = `${fileNameWithoutExt}_${Date.now()}${fileExt}`;

      console.log("Upload details:", {
        fileName: file.name,
        fileType: file.type,
        resourceType,
        isPDF,
      });

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);
      formData.append("upload_preset", "unsigned_upload");
      formData.append("resource_type", resourceType);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      console.log("Uploading to:", uploadUrl, { resourceType });

      const cloudinaryResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const uploadResult = await cloudinaryResponse.json();
      console.log("Cloudinary upload successful:", {
        url: uploadResult.secure_url,
        type: uploadResult.type,
        resourceType: uploadResult.resource_type,
      });

      // Step 3: Save metadata to our database
      const saveResponse = await fetch("/api/cloudinary/save-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          fileName: file.name,
          fileUrl: uploadResult.secure_url,
          fileSize: uploadResult.bytes,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save upload metadata");
      }

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
      });

      setSuccessFileName(file.name);
      setSuccessModalOpen(true);

      setFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        `file-${category}`
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);

      let errorMessage = "An error occurred while uploading the file";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrorMessage(errorMessage);
      setErrorModalOpen(true);
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Maximum upload of 10MB
          </p>
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
      <UploadSuccessModal
        isOpen={successModalOpen}
        fileName={successFileName}
        onClose={() => setSuccessModalOpen(false)}
      />
      <UploadErrorModal
        isOpen={errorModalOpen}
        error={errorMessage}
        onClose={() => setErrorModalOpen(false)}
      />
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
