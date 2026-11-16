// Server-side helpers for "who is logged in?" and "are they an admin?".
// Only import this from Server Components, Server Actions and Route Handlers.
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/*
  Reads the logged-in user and their profile (including role) on the server.
  - getClaims() checks the login token's signature locally (Supabase signs it
    with an ES256 key), so no extra request to Supabase Auth is needed.
  - The role always comes from the database, never from the browser.
  - cache() makes this run only once per request, even if the layout and
    the page both call it.
*/
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    return { supabase, user: null, profile: null, isAdmin: false };
  }

  const user = { id: claims.sub, email: claims.email };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile, isAdmin: profile?.role === "admin" };
});

// For pages that need a logged-in user: guests are sent to the login page
// and come back to `returnTo` after logging in.
export async function requireUser(returnTo) {
  const current = await getCurrentUser();
  if (!current.user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return current;
}
