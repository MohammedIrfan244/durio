import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/server/actions/admin-auth";

// A simple reveal endpoint that returns specific sensitive user fields
export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { userId, field, passphrase } = body as { userId?: string; field?: string; passphrase?: string };

    if (!passphrase || passphrase !== process.env.ADMIN_SECRET_PASSPHRASE) {
      return NextResponse.json({ error: "Invalid passphrase" }, { status: 401 });
    }

    if (!userId || !field) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Only allow certain sensitive fields to be revealed
    const allowed = ["fcmTokens", "rawUser"];
    if (!allowed.includes(field)) {
      return NextResponse.json({ error: "Field not allowed" }, { status: 403 });
    }

    // Log the reveal action in SystemLog for audit
    await prisma.systemLog.create({ data: { level: "INFO", message: `Admin revealed field ${field} for user ${userId}`, metadata: { action: "reveal", field, userId }, createdAt: new Date() } });

    if (field === "fcmTokens") {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { fcmTokens: true } });
      return NextResponse.json({ fcmTokens: u?.fcmTokens || [] });
    }

    if (field === "rawUser") {
      const u = await prisma.user.findUnique({ where: { id: userId } });
      // Don't return any env or system secrets, just raw DB record
      return NextResponse.json({ user: u });
    }

    return NextResponse.json({});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
