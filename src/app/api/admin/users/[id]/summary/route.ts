import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import { getUserSummary } from "@/server/admin-resolvers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const summary = await getUserSummary(id);
  if (!summary) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Audit log admin viewing a user's summary
  try {
    await (await import("@/lib/prisma")).prisma.systemLog.create({
      data: {
        level: "INFO",
        message: `Admin viewed user summary ${id}`,
        metadata: { userId: id },
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
  }

  // Return aggregated summary
  return NextResponse.json(summary);
}
