import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const recipeSuit = searchParams.get("recipeSuit") || "";

    let query = supabaseAdmin
      .from("recipe_vault")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply recipe suit filter
    if (recipeSuit && recipeSuit !== "all") {
      query = query.eq("recipe_suit", recipeSuit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching recipes:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipes: data || [],
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
