import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path.startsWith("/checkout") && !user) {
    const redirectUrl = path + request.nextUrl.search;
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(redirectUrl)}`, request.url)
    );
  }

  if (path.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
      );
    }
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/?no-admin=1", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/?no-admin=1", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/checkout", "/checkout/:path*", "/admin", "/admin/:path*"],
};
