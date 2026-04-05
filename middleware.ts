import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseBrowserKey, getSupabaseUrl } from "@/lib/supabase/env";

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseBrowserKey();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
}

async function isAdmin(supabase: ReturnType<typeof createSupabaseClient>, userId: string) {
  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();

  if (error) return false;
  return Boolean(data?.user_id);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminApiPath = pathname.startsWith("/api/admin");

  const isAdminLogin = pathname.startsWith("/admin/login");
  const isAdminForbidden = pathname.startsWith("/admin/forbidden");

  if (!isAdminPath && !isAdminApiPath) {
    return response;
  }

  if (isAdminLogin || isAdminForbidden) {
    return response;
  }

  const supabase = createSupabaseClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isAdminApiPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const admin = await isAdmin(supabase, user.id);

  if (!admin) {
    if (isAdminApiPath) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/forbidden";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
