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

    // Soft delete: set isActive to false
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
      select: { id: true, email: true },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        level: "INFO",
        message: `User account deactivated (soft delete): ${updatedUser.email}`,
        userId: userId,
        metadata: {
          action: "soft_delete",
          userId: userId,
          email: updatedUser.email,
        },
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Error in soft delete:", error);
    return NextResponse.json(
      { error: "Failed to deactivate account" },
      { status: 500 }
    );
  }
}
