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

    // Cascade delete all user data
    // Order matters: delete dependent records before parent records
    
    // 1. Delete checklist items (depends on todos)
    await prisma.checklistItem.deleteMany({
      where: { todo: { userId } },
    });

    // 2. Delete todos
    await prisma.todo.deleteMany({
      where: { userId },
    });

    // 3. Delete todo streak
    await prisma.todoStreak.deleteMany({
      where: { userId },
    });

    // 4. Delete notes
    await prisma.note.deleteMany({
      where: { userId },
    });

    // 5. Delete note folders
    await prisma.noteFolder.deleteMany({
      where: { userId },
    });

    // 6. Delete notifications
    await prisma.notification.deleteMany({
      where: { userId },
    });

    // 7. Delete events
    await prisma.event.deleteMany({
      where: { userId },
    });

    // 8. Delete event categories
    await prisma.eventCategory.deleteMany({
      where: { userId },
    });

    // 9. Delete resource links
    await prisma.resourceLink.deleteMany({
      where: { userId },
    });

    // 10. Delete routine blocks and their logs
    const routineBlocks = await prisma.routineBlock.findMany({
      where: { userId },
      select: { id: true },
    });

    if (routineBlocks.length > 0) {
      const blockIds = routineBlocks.map(b => b.id);
      await prisma.blockLog.deleteMany({
        where: { routineBlockId: { in: blockIds } },
      });
    }

    await prisma.routineBlock.deleteMany({
      where: { userId },
    });

    // 11. Delete AI usage
    await prisma.aIUsage.deleteMany({
      where: { userId },
    });

    // 12. Delete system logs related to this user
    await prisma.systemLog.deleteMany({
      where: { userId },
    });

    // Log the permanent deletion action
    await prisma.systemLog.create({
      data: {
        level: "WARNING",
        message: `User account PERMANENTLY DELETED (hard delete): ${userToDelete.email}`,
        metadata: {
          action: "hard_delete",
          userId: userId,
          email: userToDelete.email,
          timestamp: new Date().toISOString(),
        },
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Account permanently deleted. All data has been erased.",
    });
  } catch (error) {
    console.error("Error in hard delete:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete account" },
      { status: 500 }
    );
  }
}
