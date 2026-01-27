"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/auth-server";
import { generatePaystackReference } from "@/lib/paystack";
import { logUserActivity } from "./user-activities";

export type InfantRecipePackType = "starter" | "standard";

export type InfantRecipePurchaseResponse = {
  success: boolean;
  error?: string;
  reference?: string;
};

/**
 * Create an infant recipe pack purchase record
 */
export async function createInfantRecipePurchase(
  packType: InfantRecipePackType,
  amount: number,
): Promise<InfantRecipePurchaseResponse> {
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

    // Generate a unique purchase reference
    const purchaseReference = generatePaystackReference();

    // Create new purchase record (status will be 'pending' until payment is verified)
    const { error: insertError } = await supabaseAdmin
      .from("infant_recipes_purchases")
      .insert({
        user_id: user.id,
        purchase_reference: purchaseReference,
        pack_type: packType,
        amount: amount,
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating infant recipe purchase:", insertError);
      return {
        success: false,
        error: "Failed to create purchase record",
      };
    }

    return {
      success: true,
      reference: purchaseReference,
    };
  } catch (error) {
    console.error("Error in createInfantRecipePurchase:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update infant recipe purchase status after successful payment
 */
export async function updateInfantRecipePurchaseStatus(
  reference: string,
  paymentReference: string,
  status: "completed" | "failed",
): Promise<{ success: boolean; error?: string }> {
  try {
    const paymentVerifiedAt =
      status === "completed" ? new Date().toISOString() : null;

    const { error: updateError, data: updateData } = await supabaseAdmin
      .from("infant_recipes_purchases")
      .update({
        payment_reference: paymentReference,
        status: status,
        payment_verified_at: paymentVerifiedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("purchase_reference", reference)
      .select("pack_type, amount")
      .single();

    if (updateError) {
      console.error("Error updating purchase status:", updateError);
      return {
        success: false,
        error: "Failed to update purchase status",
      };
    }

    // Log activity if payment was completed
    if (status === "completed" && updateData) {
      await logUserActivity(
        "purchase",
        `Purchased ${updateData.pack_type === "starter" ? "Starter" : "Standard"} infant recipe pack`,
        {
          pack_type: updateData.pack_type,
          amount: updateData.amount,
          reference: paymentReference,
        },
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateInfantRecipePurchaseStatus:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get user's infant recipe purchases
 */
export async function getUserInfantRecipePurchases(): Promise<{
  success: boolean;
  data?: any[];
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
      .from("infant_recipes_purchases")
      .select("*")
      .eq("user_id", user.id)
      .order("purchased_at", { ascending: false });

    if (error) {
      console.error("Error fetching purchases:", error);
      return {
        success: false,
        error: "Failed to fetch purchases",
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in getUserInfantRecipePurchases:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Check if user has purchased a specific pack
 */
export async function checkUserHasPurchasedPack(
  packType: InfantRecipePackType,
): Promise<{
  success: boolean;
  hasPurchased?: boolean;
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
      .from("infant_recipes_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("pack_type", packType)
      .eq("status", "completed")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking purchase:", error);
      return {
        success: false,
        error: "Failed to check purchase status",
      };
    }

    return {
      success: true,
      hasPurchased: !!data,
    };
  } catch (error) {
    console.error("Error in checkUserHasPurchasedPack:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
