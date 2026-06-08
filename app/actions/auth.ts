"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AuthResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
};

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  phone?: string,
  purchaseReference?: string,
): Promise<AuthResponse> {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
      return {
        success: false,
        error: "Server configuration error. Please contact support.",
      };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      return {
        success: false,
        error: "Server configuration error. Please contact support.",
      };
    }

    // Format phone number with +234 prefix if provided
    let formattedPhone = phone ? "+234" + phone : undefined;

    // Build full name from first and last name (needed for metadata)
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || undefined;

    // Create auth user with email verification required
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: formattedPhone,
          },
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/login?verified=true`,
        },
      });

    if (authError) {
      const alreadyRegistered = /already registered/i.test(authError.message || "");
      if (alreadyRegistered && purchaseReference) {
        const normalizedEmail = email.trim().toLowerCase();

        const { data: purchase, error: purchaseError } = await supabaseAdmin
          .from("infant_recipes_purchases")
          .select("user_id, status")
          .eq("purchase_reference", purchaseReference)
          .eq("status", "completed")
          .maybeSingle();

        if (purchaseError || !purchase?.user_id) {
          return {
            success: false,
            error: "Unable to validate purchase reference for account completion.",
          };
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users_profile")
          .select("id, email")
          .eq("id", purchase.user_id)
          .maybeSingle();

        if (
          profileError ||
          !profile ||
          (profile.email || "").toLowerCase() !== normalizedEmail
        ) {
          return {
            success: false,
            error: "This purchase reference does not match the provided email.",
          };
        }

        const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
          purchase.user_id,
          {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              phone: formattedPhone,
            },
          },
        );

        if (updateUserError) {
          return {
            success: false,
            error: "Failed to complete account setup. Please try again.",
          };
        }

        await supabaseAdmin
          .from("users_profile")
          .update({
            email: normalizedEmail,
            full_name: fullName,
            phone: formattedPhone,
          })
          .eq("id", purchase.user_id);

        return {
          success: true,
          user: {
            id: purchase.user_id,
            email: normalizedEmail,
          },
        };
      }

      console.error("Sign up error:", authError);
      return {
        success: false,
        error:
          authError.message ||
          "Failed to create account. Please try again later.",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user account",
      };
    }

    // Create user profile immediately on signup
    // Metadata is also stored in auth.user for reference
    const { error: profileError } = await supabaseAdmin
      .from("users_profile")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        phone: formattedPhone,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail the signup if profile creation fails
      // The user account is still created
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
      },
    };
  } catch (error) {
    console.error("Unexpected signup error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sign in a user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Note: For client-side sign in, we can't use server actions directly
    // This function validates credentials on the server
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Failed to sign in",
      };
    }

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      return {
        success: false,
        error:
          "Please verify your email address before signing in. Check your inbox for the verification link.",
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
    };
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users_profile")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Get profile error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected get profile error:", error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<
    Omit<UserProfile, "id" | "email" | "created_at" | "updated_at">
  >
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("users_profile")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected update profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate and redirect after successful sign out
    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Reset user password (admin function for forgot password flow)
 */
export async function resetUserPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user by email
    const { data: users, error: getUserError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      console.error("Error listing users:", getUserError);
      return {
        success: false,
        error: "Failed to reset password. Please try again.",
      };
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Update user password using admin
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

    if (updateError) {
      console.error("Password update error:", updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected password reset error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
