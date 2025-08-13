import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  try {
    // Check auth session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // If there's a session error, clear the session and redirect to login
    if (sessionError) {
      console.error("Session error in middleware:", sessionError);
      // Clear any invalid session data
      await supabase.auth.signOut();

      if (!request.nextUrl.pathname.startsWith("/login")) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        return NextResponse.redirect(redirectUrl);
      }
      return res;
    }

    // If no session and trying to access protected route, redirect to login
    if (!session && !request.nextUrl.pathname.startsWith("/login")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    // If session exists, check role-based access
    if (session) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        let role = "department_head"; // Default role

        if (profileError) {
          console.error("Profile fetch error in middleware:", profileError);
          // If profile doesn't exist, allow access but with default role
          console.log("Profile not found, using default role");
        } else {
          role = profile?.role || "department_head";
        }

        // Admin routes protection
        if (
          request.nextUrl.pathname.startsWith("/admin") &&
          role !== "admin" &&
          role !== "super_admin"
        ) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/";
          return NextResponse.redirect(redirectUrl);
        }

        // Department routes protection
        if (
          request.nextUrl.pathname.startsWith("/department") &&
          role !== "department_head" &&
          role !== "super_admin"
        ) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/";
          return NextResponse.redirect(redirectUrl);
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error);
        // If there's an error checking the profile, redirect to login
        await supabase.auth.signOut();
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's any error, redirect to login
    if (!request.nextUrl.pathname.startsWith("/login")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  }
}

// Temporarily disable middleware to test login redirect
export const config = {
  matcher: [],
};
