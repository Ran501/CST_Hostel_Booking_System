import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/activate", "/set-password", "/manual"];

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-must-change-in-production"
);

function isPublic(pathname) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip API routes — they handle their own auth
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const sessionCookie = request.cookies.get("session");
  let session = null;

  if (sessionCookie?.value) {
    try {
      const { payload } = await jwtVerify(sessionCookie.value, secret);
      if (payload?.studentNumber) session = payload;
    } catch {
      session = null;
    }
  }

  // Already logged in → redirect away from /login
  if (pathname === "/login" && session) {
    const dest =
      session.role === "admin" || session.role === "counselor"
        ? "/admin_dashboard"
        : "/homecontent";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Public paths — allow through
  if (isPublic(pathname)) return NextResponse.next();

  // Not logged in → send to /login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Only admin and counselor can reach admin area
  if (
    pathname.startsWith("/admin_dashboard") &&
    session.role !== "admin" &&
    session.role !== "counselor"
  ) {
    return NextResponse.redirect(new URL("/homecontent", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};
