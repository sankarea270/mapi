import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: auth check, no i18n
  if (isAdminRoute(pathname)) {
    const session = request.cookies.get("mapi-admin-session");

    if (pathname === "/admin/login") {
      if (session) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // All other routes: next-intl locale detection
  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
