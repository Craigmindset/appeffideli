import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function getProvidedToken(request: Request) {
  const headerToken = request.headers.get("x-keepalive-token");
  if (headerToken) return headerToken;

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  return queryToken;
}

async function pingTable(tableName: string) {
  const { error } = await supabaseAdmin
    .from(tableName)
    .select("id", { head: true })
    .limit(1);

  return { ok: !error, error, tableName };
}

export async function GET(request: Request) {
  const requiredToken = process.env.KEEPALIVE_TOKEN;

  if (requiredToken) {
    const providedToken = getProvidedToken(request);
    if (!providedToken || providedToken !== requiredToken) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const tablesToTry = ["users_profile", "orders", "user_activities"]; // common tables in this repo

  for (const tableName of tablesToTry) {
    const result = await pingTable(tableName);
    if (result.ok) {
      return NextResponse.json({
        ok: true,
        table: tableName,
        at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error:
        "Keepalive ping failed. Ensure at least one of the expected tables exists or adjust the keepalive route.",
    },
    { status: 500 },
  );
}
