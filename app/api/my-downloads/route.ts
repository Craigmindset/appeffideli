import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase";

function getDownloadTitle(apartmentType?: string) {
  const titleMap: Record<string, string> = {
    studio: "Studio Household Cleaning Routine",
    apartment: "Apartment Household Cleaning Routine",
    bungalow: "Bungalow Household Cleaning Routine",
    "duplex-terrace": "Duplex/Terrace Household Cleaning Routine",
    "duplex-balcony": "Duplex with Balcony Household Cleaning Routine",
    "infant-recipe": "Infant Recipe Plan",
  };

  return apartmentType ? titleMap[apartmentType] || "Purchased Package" : "Purchased Package";
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id, reference, apartment_type, order_type, amount, status, created_at, landmark")
      .eq("user_id", user.id)
      .eq("order_type", "download")
      .eq("status", "success")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      downloads: (data || []).map((item) => ({
        id: item.id,
        title: getDownloadTitle(item.apartment_type || undefined),
        downloadUrl:
          item.apartment_type === "infant-recipe"
            ? `/download/${item.reference}?preferences=${encodeURIComponent(item.landmark || "")}`
            : `/download/${item.reference}`,
        paymentVerified: item.status === "success",
        amount: item.amount ?? 0,
        createdAt: item.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}
