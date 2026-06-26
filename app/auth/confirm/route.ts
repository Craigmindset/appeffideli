import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const nextParam = url.searchParams.get("next") || "/dashboard/overview";
  const nextPath = nextParam.startsWith("/") ? nextParam : "/dashboard/overview";

  const redirectUrl = new URL(nextPath, url.origin);
  const loginUrl = new URL("/login", url.origin);

  try {
    const supabase = await createServerSupabaseClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as "signup" | "recovery" | "magiclink" | "invite" | "email_change" | "email",
        token_hash: tokenHash,
      });

      if (!error) {
        return NextResponse.redirect(redirectUrl);
      }
    }

    loginUrl.searchParams.set("error", "Unable to confirm email link");
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    loginUrl.searchParams.set("error", "Invalid or expired confirmation link");
    return NextResponse.redirect(loginUrl);
  }
}
