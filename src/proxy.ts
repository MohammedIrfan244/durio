import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { info } from "./lib/utils/logger";
import { checkRateLimit } from "./lib/server/rate-limit";
import { APP_REGISTRY } from "@/config/modules";

// Static public paths that don't require authentication
const STATIC_PUBLIC_PATHS = [
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/site.webmanifest",
  "/privacy-policy",
];

// Static public prefixes for static assets and resources
const STATIC_PUBLIC_PREFIXES = [
  "/favicons/",
  "/downloads/",
  "/.well-known/",
];

// Admin routes use separate auth system (cookie-based)
const ADMIN_PREFIXES = [
  "/admin",
  "/api/admin",
];

// Auth routes (NextAuth)
const AUTH_PREFIX = "/auth/";

// Protected module routes - generated from APP_REGISTRY
const PROTECTED_PATHS = Object.values(APP_REGISTRY.MODULES).map(module => module.path);

function isPublicPath(pathname: string): boolean {
  return (
    STATIC_PUBLIC_PATHS.includes(pathname) ||
    STATIC_PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
  );
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith(AUTH_PREFIX);
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

function isStaticAsset(pathname: string): boolean {
  return STATIC_PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix)) || 
         STATIC_PUBLIC_PATHS.includes(pathname);
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const time = new Date().toISOString();

  info("ROUTE:", `${pathname} at ${time}`);

  // Rate Limiting for API routes (except static assets)
  if (pathname.startsWith("/api/") && !isStaticAsset(pathname)) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    const ipLimit = await checkRateLimit(`global_ip:${ip}`);
    if (!ipLimit.allowed) {
      return new NextResponse("Too Many Requests", { 
        status: 429,
        headers: ipLimit.retryAfter ? { "Retry-After": String(ipLimit.retryAfter) } : undefined
      });
    }
  }

  // Public paths - allow without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Admin paths - skip NextAuth, use separate cookie-based auth (checked at route level)
  if (isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // Get NextAuth token for auth and protected routes
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  info("SESSION TOKEN:", token?.sub ?? "NO TOKEN");

  // Auth paths - redirect to dashboard if already logged in
  if (isAuthPath(pathname)) {
    if (token) {
      info("REDIRECTING TO DASHBOARD");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected module paths - require authentication
  if (isProtectedPath(pathname)) {
    if (!token) {
      info("NOT AUTHENTICATED - REDIRECTING TO LOGIN");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // Default: redirect to login (catch-all for unexpected routes)
  if (!token) {
    info("UNKNOWN ROUTE - REDIRECTING TO LOGIN");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api/auth|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|favicons).*)",
  ],
};
