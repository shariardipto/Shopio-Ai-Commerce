import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { safeRedirectPath } from "@/lib/shop";

// The email confirmation link from Supabase comes back here with a one-time "code".
// We exchange it for a login session, then send the user on to the shop.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // The link was opened in another browser or has expired: the user can simply log in.
  return NextResponse.redirect(`${origin}/login?message=confirm`);
}
