import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase";

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
      .from("purchased_downloads")
      .select("id, title, package_url, payment_verified, amount, created_at")
      .eq("email", user.email)
      .eq("payment_verified", true)
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
        title: item.title,
        downloadUrl: item.package_url,
        paymentVerified: item.payment_verified,
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
