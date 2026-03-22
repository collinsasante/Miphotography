import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isClientRoute = pathname.startsWith("/client");
  const isAdminRoute  = pathname.startsWith("/admin");

  if (!isClientRoute && !isAdminRoute) return NextResponse.next();

  const token = req.cookies.get("__session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyFirebaseToken(token);

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("__session");
    res.cookies.delete("__role");
    return res;
  }

  // Check admin access via the role cookie (set by /api/auth/session)
  if (isAdminRoute) {
    const role = req.cookies.get("__role")?.value;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/client", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*", "/admin/:path*"],
};
