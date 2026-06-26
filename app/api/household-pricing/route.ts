import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("price_rate_household")
      .select("id, apartment_type, home_type, pdf_rate, audio_rate, vat")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        success: true,
        rates: data ?? [],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching household pricing rates:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load household pricing rates",
      },
      { status: 500 },
    );
  }
}
