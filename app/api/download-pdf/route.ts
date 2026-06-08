import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth-server";
import { getPdfUrl } from "@/app/actions/pdf";

const INFANT_PACK_URLS: Record<string, string> = {
  starter:
    "https://dohdf572hojoyskk.public.blob.vercel-storage.com/One-%20Time%20infant%20%26%20Toddler%20Recipe%20Pack%20%28BASIC%20PACK%29.pdf",
  standard:
    "https://dohdf572hojoyskk.public.blob.vercel-storage.com/One-%20Time%20infant%20%26%20Toddler%20Recipe%20Pack%20%28STANDARD%20PACK%29.pdf",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get("reference");
  const preferences = searchParams.get("preferences") || "";

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Reference is required" },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();

  try {
    // Try orders first
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("apartment_type, order_type, status, email, landmark")
      .eq("reference", reference)
      .maybeSingle();

    if (order && order.status === "success" && order.order_type === "download") {
      // If a user is signed in, enforce ownership. If not signed in, allow access by valid paid reference.
      if (user?.email && order.email !== user.email) {
        return NextResponse.json(
          { success: false, error: "Unauthorized download for this account" },
          { status: 403 },
        );
      }

      const prefs =
        typeof preferences === "string" && preferences.trim()
          ? preferences
          : order.landmark || "";
      const pdfUrl = await getPdfUrl(
        order.apartment_type,
        order.order_type,
        prefs,
      );
      const upstream = await fetch(pdfUrl);
      if (!upstream.ok || !upstream.body) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch PDF" },
          { status: 502 },
        );
      }
      const filename =
        order.apartment_type === "infant-recipe"
          ? "Effideli-Infant-Recipe-Plan.pdf"
          : `Effideli-${order.apartment_type}-Routine.pdf`;
      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Otherwise, check infant_recipes_purchases
    const { data: purchase } = await supabaseAdmin
      .from("infant_recipes_purchases")
      .select("status, user_id, pack_type")
      .eq("purchase_reference", reference)
      .maybeSingle();

    if (!purchase || purchase.status !== "completed") {
      return NextResponse.json(
        { success: false, error: "Unauthorized or payment not successful" },
        { status: 403 },
      );
    }

    // If signed in, enforce ownership. If not signed in, allow valid paid reference download.
    if (user?.id && purchase.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized download for this account" },
        { status: 403 },
      );
    }

    // Stream the actual blob file for the pack
    const packUrl = INFANT_PACK_URLS[purchase.pack_type];
    if (!packUrl) {
      return NextResponse.json(
        { success: false, error: "Unknown pack type" },
        { status: 404 },
      );
    }
    const upstream = await fetch(packUrl);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch PDF" },
        { status: 502 },
      );
    }

    const filename =
      purchase.pack_type === "starter"
        ? "Effideli-Infant-Recipe-Plan-Basic.pdf"
        : "Effideli-Infant-Recipe-Plan-Standard.pdf";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Secure download error:", error);
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}
