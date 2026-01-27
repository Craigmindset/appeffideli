"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/auth-server";

export type ActivityType =
  | "download"
  | "subscription"
  | "meal_plan"
  | "purchase"
  | "login"
  | "profile_update"
  | "payment";

export type UserActivity = {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  activity_description: string;
  metadata?: Record<string, any>;
  created_at: string;
};

/**
 * Log a user activity
 */
export async function logUserActivity(
  activityType: ActivityType,
  description: string,
  metadata?: Record<string, any>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const { error: insertError } = await supabaseAdmin
      .from("user_activities")
      .insert({
        user_id: user.id,
        activity_type: activityType,
        activity_description: description,
        metadata: metadata || null,
      });

    if (insertError) {
      console.error("Error logging activity:", insertError);
      return {
        success: false,
        error: "Failed to log activity",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in logUserActivity:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get user's recent activities
 */
export async function getUserRecentActivities(limit: number = 10): Promise<{
  success: boolean;
  data?: UserActivity[];
  error?: string;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const { data, error } = await supabaseAdmin
      .from("user_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching activities:", error);
      return {
        success: false,
        error: "Failed to fetch activities",
      };
    }

    return {
      success: true,
      data: data as UserActivity[],
    };
  } catch (error) {
    console.error("Error in getUserRecentActivities:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete old activities (for cleanup)
 */
export async function deleteOldActivities(
  daysOld: number = 90,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabaseAdmin
      .from("user_activities")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", cutoffDate.toISOString());

    if (error) {
      console.error("Error deleting old activities:", error);
      return {
        success: false,
        error: "Failed to delete old activities",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteOldActivities:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
