import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth-server";

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

    const body = await request.json();
    const { category, fileName, fileUrl, fileSize } = body;

    if (!category || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save metadata to database - use the URL as-is for preview capability
    // Users can preview PDFs in browser, and download via download endpoint
    const { data, error: dbError } = await supabase
      .from("admin_uploads")
      .insert({
        category,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize || 0,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Save upload error:", error);
    return NextResponse.json(
      { error: "Failed to save upload metadata" },
      { status: 500 }
    );
  }
}
