import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Login, cadastro e "esqueci a senha": quem já está logado vai para a dashboard. */
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

/** Páginas abertas para todos, logado ou não. */
const PUBLIC_PAGES = ["/auth/callback", "/privacy", "/terms", "/offline"];

const matches = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(path + "/"));

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = matches(pathname, AUTH_PAGES);

  if (matches(pathname, PUBLIC_PAGES)) {
    return supabaseResponse;
  }

  if (!user && !isAuthPage) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse("Não autenticado.", { status: 401 });
    }
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return supabaseResponse;
}
