import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { error, info } from "./lib/utils/logger";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const publicPaths = [
    "/",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json",
  ];

  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/favicons/")
  ) {
    return NextResponse.next();
  }

  // Authentication logic starts here...
  const time = new Date().toISOString();
  info("ROUTE:", pathname + " at " + time);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  info("SESSION TOKEN:", token?.email ?? "NO TOKEN");

  const isAuthPage = pathname.startsWith("/auth/login");

  if (token && isAuthPage) {
    info("REDIRECTING TO DASHBOARD");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && !isAuthPage) {
    error("NOT AUTHENTICATED");
    info("REDIRECTING TO LOGIN");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api/auth|favicon.ico|robots.txt|sitemap.xml|manifest.json|favicons).*)",
  ],
};
