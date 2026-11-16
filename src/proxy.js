import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Pages that need a logged-in user.
const PROTECTED_PATHS = ["/checkout", "/my-orders", "/admin"];

/*
  Runs before every page request:
  1. Refreshes the Supabase auth session cookie.
  2. Sends logged-out users from protected pages to /login (quick check).
  The pages themselves still check the user and admin role on the server,
  and Supabase RLS protects the data itself.
*/
export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() refreshes the session if needed and verifies the token locally
  // (no request to Supabase Auth on every page view).
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;

    const redirectResponse = NextResponse.redirect(loginUrl);
    // Keep any auth cookie changes made above.
    supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
