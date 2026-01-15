import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth-server";
import crypto from "crypto";

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
    const { folder } = body;

    if (!folder) {
      return NextResponse.json(
        { error: "Folder is required" },
        { status: 400 }
      );
    }

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Parameters to include in signature - must match what we send in upload
    const params = {
      folder: `effideli/${folder}`,
      timestamp,
      upload_preset: "unsigned_upload",
    };

    // Create string to sign - parameters must be sorted alphabetically
    const paramsArray = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`);

    const stringToSign = paramsArray.join("&");

    // Add API secret to the string
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign + process.env.CLOUDINARY_API_SECRET!)
      .digest("hex");

    console.log("Signature generated:", {
      stringToSign,
      signature,
      timestamp,
      folder: params.folder,
    });

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      uploadPreset: "unsigned_upload",
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
