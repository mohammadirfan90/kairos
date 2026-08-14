import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("kairos_session_token")?.value;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logo.svg") ||
    pathname.startsWith("/logo_lightMode.svg") ||
    pathname.startsWith("/logo_darkMode.svg") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  // Allow auth API routes and public static files
  if (isApiAuth || isPublicAsset) {
    return NextResponse.next();
  }

  // If user is already authenticated and trying to access login/signup -> redirect to dashboard
  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is NOT authenticated and trying to access protected routes -> redirect to login or return 401 for API
  if (!sessionToken && !isAuthRoute) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|logo_lightMode.svg|logo_darkMode.svg|logo.png).*)",
  ],
};

export default proxy;
