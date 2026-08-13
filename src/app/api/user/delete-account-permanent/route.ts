import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user email before deletion for logging
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Mark user as deleted and set deletion timestamp
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Log the permanent deletion action
    await prisma.systemLog.create({
      data: {
        level: "WARNING",
        message: `User account marked for PERMANENT DELETION (hard delete request): ${userToDelete.email}`,
        metadata: {
          action: "hard_delete_request",
          userId: userId,
          email: userToDelete.email,
          timestamp: new Date().toISOString(),
        },
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Account marked for permanent deletion.",
    });
  } catch (error) {
    console.error("Error in hard delete request:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete account" },
      { status: 500 }
    );
  }
}
