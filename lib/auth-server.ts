import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

function isDynamicServerUsageError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

/**
 * Create a Supabase client for server-side operations with cookie handling
 * This is used in Server Components, Route Handlers, and Server Actions
 */
export const createServerSupabaseClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting can fail in middleware
            // This is expected in some cases
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Cookie removal can fail in middleware
            // This is expected in some cases
          }
        },
      },
    }
  );
});

/**
 * Get the current authenticated user from the server
 * Returns null if not authenticated
 * This function is cached to avoid multiple database calls
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Error getting current user:", error);
    }
    return null;
  }
});

/**
 * Get the current session from the server
 * Returns null if no active session
 */
export const getSession = cache(async () => {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Error getting session:", error);
    }
    return null;
  }
});

/**
 * Require authentication - throws redirect if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    // Return redirect data instead of throwing
    return { authenticated: false, user: null };
  }

  return { authenticated: true, user };
}

/**
 * Get user profile data with authentication check
 */
export async function getUserProfileServer(userId?: string) {
  const user = await getCurrentUser();

  if (!user && !userId) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("users_profile")
    .select("*")
    .eq("id", userId || user?.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}
