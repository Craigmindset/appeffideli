"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/auth-server";
import { generatePaystackReference } from "@/lib/paystack";

export type MealPlanType = "basic" | "premium" | "vip";

export type MealSubscriptionResponse = {
  success: boolean;
  error?: string;
  reference?: string;
};

/**
 * Create a meal plan subscription for a user
 */
export async function createMealSubscription(
  planType: MealPlanType,
  amount: number
): Promise<MealSubscriptionResponse> {
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

    // Generate a unique subscription reference
    const subscriptionReference = generatePaystackReference();

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Determine the table name based on plan type
    const tableName = `meal_${planType}`;

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingSubscription) {
      // Cancel the existing subscription
      await supabaseAdmin
        .from(tableName)
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", existingSubscription.id);
    }

    // Create new subscription record (status will be 'inactive' until payment is verified)
    const { error: insertError } = await supabaseAdmin.from(tableName).insert({
      user_id: user.id,
      subscription_reference: subscriptionReference,
      amount: amount,
      status: "inactive",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Error creating subscription:", insertError);
      return {
        success: false,
        error: "Failed to create subscription",
      };
    }

    return {
      success: true,
      reference: subscriptionReference,
    };
  } catch (error) {
    console.error("Error in createMealSubscription:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update meal plan subscription after successful payment
 */
export async function updateMealSubscriptionStatus(
  reference: string,
  paymentReference: string,
  planType: MealPlanType
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

    const tableName = `meal_${planType}`;

    // Update subscription status to active
    const { error: updateError } = await supabaseAdmin
      .from(tableName)
      .update({
        status: "active",
        payment_reference: paymentReference,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_reference", reference)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating subscription status:", updateError);
      return {
        success: false,
        error: "Failed to update subscription status",
      };
    }

    // Update users_profile with current subscription
    const { error: profileError } = await supabaseAdmin
      .from("users_profile")
      .update({
        meal_subscription: tableName,
        meal_subscription_status: "active",
        meal_subscription_started_at: new Date().toISOString(),
        meal_subscription_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating user profile:", profileError);
      return {
        success: false,
        error: "Failed to update user profile",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in updateMealSubscriptionStatus:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get user's current meal subscription
 */
export async function getUserMealSubscription() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Get user profile to check current subscription
    const { data: profile } = await supabaseAdmin
      .from("users_profile")
      .select(
        "meal_subscription, meal_subscription_status, meal_subscription_reference"
      )
      .eq("id", user.id)
      .single();

    if (!profile || !profile.meal_subscription) {
      return null;
    }

    // Get subscription details from the appropriate table
    const { data: subscription } = await supabaseAdmin
      .from(profile.meal_subscription)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    return subscription;
  } catch (error) {
    console.error("Error in getUserMealSubscription:", error);
    return null;
  }
}
