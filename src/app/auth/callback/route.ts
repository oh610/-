import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("users")
        .select("tier")
        .eq("id", data.user.id)
        .maybeSingle();

      return NextResponse.redirect(`${origin}${profile?.tier === "유료" ? "/home" : "/pricing"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
