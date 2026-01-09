import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { error, info } from "./lib/utils/logger";

export async function proxy(req: NextRequest) {

  const time = new Date().toISOString();
  info("ROUTE:", req.nextUrl.pathname+ " at " + time);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  info("SESSION TOKEN:", token?.email ?? "NO TOKEN");

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth/login");

  if (token && isAuthPage) {
    info("REDIRECTING TO MAIN");
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !isAuthPage) {
    error("NOT AUTHENTICATED");
    info("REDIRECTING TO LOGIN");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api/auth|favicon.ico).*)"],
};
