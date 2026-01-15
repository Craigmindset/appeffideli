import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createServerSupabaseClient } from "@/lib/auth-server";

// Configure route segment for large file uploads
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("users_profile")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get form data - try catch to handle large files
    let formData;
    try {
      // Log request details for debugging
      console.log("Attempting to parse formData...", {
        method: request.method,
        contentType: request.headers.get("content-type"),
      });

      formData = await request.formData();
      console.log("FormData parsed successfully");
    } catch (error) {
      console.error("FormData parsing error:", error);

      // Return more specific error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        {
          error: "Failed to parse file upload",
          details: errorMessage,
          hint: "This usually happens with very large files or network interruptions. Try a smaller file or check your connection.",
        },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json(
        { error: "No category provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type based on file type
    let resourceType: "auto" | "raw" = "raw";
    if (file.type.startsWith("image/")) {
      resourceType = "auto";
    }

    console.log("Starting upload:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category,
      resourceType,
    });

    // Upload to Cloudinary with buffer
    const uploadResult = await uploadToCloudinary(
      buffer,
      category,
      file.name,
      resourceType
    );

    console.log("Upload result:", uploadResult);

    // Save metadata to database (admin_uploads table)
    const { error: dbError } = await supabase.from("admin_uploads").insert({
      category,
      file_name: file.name,
      file_url: uploadResult.url,
      file_size: uploadResult.size,
      uploaded_by: user.id,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileName: file.name,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
