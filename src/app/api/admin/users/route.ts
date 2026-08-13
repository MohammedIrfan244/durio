import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/server/actions/admin-auth";

export async function GET(request: Request) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

const where: any = {};
  if (q) {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(q);
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
      ...(isValidObjectId ? [{ id: q }] : []),
    ];
  }

  const total = await prisma.user.count({ where });
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      displayName: true,
      avatar: true,
      timezone: true,
      createdAt: true,
      isActive: true,
      isDeleted: true,
      deactivatedAt: true,
      deletedAt: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Audit log
  try {
    await prisma.systemLog.create({
      data: {
        level: "INFO",
        message: `Admin listed users`,
        metadata: { query: q, page, limit },
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
  }

  return NextResponse.json({ total, page, limit, users });
}
