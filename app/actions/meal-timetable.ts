"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/auth-server";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface MealTimetableEntry {
  id?: string;
  user_id?: string;
  day_of_week: DayOfWeek;
  week_number: number;

  breakfast?: string;
  breakfast_time?: string;
  breakfast_notes?: string;

  morning_snack?: string;
  morning_snack_time?: string;
  morning_snack_notes?: string;

  lunch?: string;
  lunch_time?: string;
  lunch_notes?: string;

  afternoon_bites?: string;
  afternoon_bites_time?: string;
  afternoon_bites_notes?: string;

  dinner?: string;
  dinner_time?: string;
  dinner_notes?: string;

  side_dish?: string;
  side_dish_time?: string;
  side_dish_notes?: string;

  evening_snack?: string;
  evening_snack_time?: string;
  evening_snack_notes?: string;

  dessert?: string;
  dessert_time?: string;
  dessert_notes?: string;

  created_at?: string;
  updated_at?: string;
}

/**
 * Get meal timetable for a specific week
 */
export async function getMealTimetable(weekNumber: number = 1) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return {
        success: false,
        error: "User not authenticated. Please log in.",
        data: null,
        userId: null,
      };
    }

    console.log("✅ User authenticated - ID:", user.id, "Email:", user.email);
    console.log("Fetching meal timetable for week:", weekNumber);

    const { data, error } = await supabaseAdmin
      .from("meal_timetable")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_number", weekNumber);

    console.log("Query result - Data count:", data?.length, "Error:", error);

    if (error) {
      console.error("Database error fetching meal timetable:", error);
      return {
        success: false,
        error: error.message,
        data: null,
        userId: user.id,
      };
    }

    if (!data || data.length === 0) {
      console.log(
        "ℹ️ No meal data found for user:",
        user.id,
        "week:",
        weekNumber
      );
      return {
        success: true,
        data: [],
        error: null,
        userId: user.id,
      };
    }

    // Sort by day of week in proper order (Monday to Sunday)
    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };
    const sortedData = data?.sort(
      (a, b) =>
        dayOrder[a.day_of_week as DayOfWeek] -
        dayOrder[b.day_of_week as DayOfWeek]
    );

    console.log(
      "✅ Returning",
      sortedData?.length,
      "meal records for user:",
      user.id
    );
    return {
      success: true,
      data: sortedData,
      error: null,
      userId: user.id,
    };
  } catch (error) {
    console.error("Error in getMealTimetable:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      data: null,
    };
  }
}

/**
 * Get meal timetable for a specific day
 */
export async function getMealTimetableByDay(
  dayOfWeek: DayOfWeek,
  weekNumber: number = 1
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated", data: null };
    }

    const { data, error } = await supabaseAdmin
      .from("meal_timetable")
      .select("*")
      .eq("user_id", user.id)
      .eq("day_of_week", dayOfWeek)
      .eq("week_number", weekNumber)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching meal timetable:", error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: data || null, error: null };
  } catch (error) {
    console.error("Error in getMealTimetableByDay:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      data: null,
    };
  }
}

/**
 * Create or update meal timetable entry
 */
export async function saveMealTimetable(entry: MealTimetableEntry) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if entry exists
    const { data: existing } = await supabaseAdmin
      .from("meal_timetable")
      .select("id")
      .eq("user_id", user.id)
      .eq("day_of_week", entry.day_of_week)
      .eq("week_number", entry.week_number)
      .single();

    if (existing) {
      // Update existing entry
      const { error } = await supabaseAdmin
        .from("meal_timetable")
        .update({
          ...entry,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating meal timetable:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } else {
      // Create new entry
      const { error } = await supabaseAdmin.from("meal_timetable").insert({
        ...entry,
        user_id: user.id,
      });

      if (error) {
        console.error("Error creating meal timetable:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    }
  } catch (error) {
    console.error("Error in saveMealTimetable:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete meal timetable entry
 */
export async function deleteMealTimetable(
  dayOfWeek: DayOfWeek,
  weekNumber: number = 1
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabaseAdmin
      .from("meal_timetable")
      .delete()
      .eq("user_id", user.id)
      .eq("day_of_week", dayOfWeek)
      .eq("week_number", weekNumber);

    if (error) {
      console.error("Error deleting meal timetable:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error in deleteMealTimetable:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all available weeks with meal timetables
 */
export async function getAvailableWeeks() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated", data: [] };
    }

    const { data, error } = await supabaseAdmin
      .from("meal_timetable")
      .select("week_number")
      .eq("user_id", user.id)
      .order("week_number");

    if (error) {
      console.error("Error fetching available weeks:", error);
      return { success: false, error: error.message, data: [] };
    }

    // Get unique week numbers
    const uniqueWeeks = [...new Set(data.map((item) => item.week_number))];

    return { success: true, data: uniqueWeeks, error: null };
  } catch (error) {
    console.error("Error in getAvailableWeeks:", error);
    return { success: false, error: "An unexpected error occurred", data: [] };
  }
}
