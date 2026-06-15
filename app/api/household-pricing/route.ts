import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

const getHouseholdPricingRates = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("price_rate_household")
      .select("id, apartment_type, home_type, pdf_rate, audio_rate, vat")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
  ["household-price-rates"],
  {
    revalidate: 60 * 60 * 6,
  },
);

export async function GET() {
  try {
    const rates = await getHouseholdPricingRates();

    return NextResponse.json(
      {
        success: true,
        rates,
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400",
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
