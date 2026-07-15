"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auditLogger } from "@/lib/server/logger";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET_PASSPHRASE = process.env.ADMIN_SECRET_PASSPHRASE;
const COOKIE_NAME = "durio_admin_session";

export async function verifyAdminStep1(email: string, password: string) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    auditLogger.error("Admin credentials not configured in .env");
    return { success: false, error: "Not configured" };
  }

  // Use constant time comparison in a real app, but this is fine for .env match
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    auditLogger.info("Admin Step 1 Auth Success", undefined, { email });
    return { success: true };
  }

  auditLogger.warn("Failed admin step 1 attempt", undefined, { email });
  // We return success: false, the client should trigger a 404
  return { success: false, error: "Invalid credentials" };
}

export async function verifyAdminStep2(passphrase: string) {
  if (!ADMIN_SECRET_PASSPHRASE) {
    return { success: false };
  }

  if (passphrase === ADMIN_SECRET_PASSPHRASE) {
    // Generate a simple token (in production, use a signed JWT)
    // For this use case, setting a secure cookie that equals the passphrase is an easy check.
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, ADMIN_SECRET_PASSPHRASE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    
    auditLogger.info("Admin Step 2 Auth Success - Logged into Dashboard");
    return { success: true };
  }
  
  auditLogger.warn("Failed admin step 2 attempt (passphrase)");
  return { success: false };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  auditLogger.info("Admin logged out");
  redirect("/");
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  
  if (!token || token.value !== ADMIN_SECRET_PASSPHRASE) {
    return false;
  }
  return true;
}
