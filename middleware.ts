import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./lib/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, icons, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|svg|jpg|jpeg|gif|webp|ico|css|js)$/i)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // Protect /dashboard
  if (pathname.startsWith("/dashboard") && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from /auth/login or /auth/sign-up
  if ((pathname === "/auth/login" || pathname === "/auth/sign-up") && session) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
