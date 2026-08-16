import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin auth
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing user id" },
        { status: 400 }
      );
    }

    // Get user and verify they're marked for deletion
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true,
        email: true,
        isDeleted: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isDeleted) {
      return NextResponse.json(
        { error: "User is not marked for deletion" },
        { status: 400 }
      );
    }

    // Cascade delete all user data
    // Order matters: delete dependent records before parent records

    // 1. Delete checklist items (depends on todos)
    await prisma.checklistItem.deleteMany({
      where: { todo: { userId: id } },
    });

    // 2. Delete todos
    await prisma.todo.deleteMany({
      where: { userId: id },
    });

    // 3. Delete todo streak
    await prisma.todoStreak.deleteMany({
      where: { userId: id },
    });

    // 4. Delete notes
    await prisma.note.deleteMany({
      where: { userId: id },
    });

    // 5. Delete note folders
    await prisma.noteFolder.deleteMany({
      where: { userId: id },
    });

    // 6. Delete notifications
    await prisma.notification.deleteMany({
      where: { userId: id },
    });

    // 7. Delete events
    await prisma.event.deleteMany({
      where: { userId: id },
    });

    // 8. Delete event categories
    await prisma.eventCategory.deleteMany({
      where: { userId: id },
    });

    // 9. Delete resource links
    await prisma.resourceLink.deleteMany({
      where: { userId: id },
    });

    // 10. Delete routine blocks and their logs
    const routineBlocks = await prisma.routineBlock.findMany({
      where: { userId: id },
      select: { id: true },
    });

    if (routineBlocks.length > 0) {
      const blockIds = routineBlocks.map(b => b.id);
      await prisma.blockLog.deleteMany({
        where: { routineBlockId: { in: blockIds } },
      });
    }

    await prisma.routineBlock.deleteMany({
      where: { userId: id },
    });

    // 11. Delete AI usage
    await prisma.aIUsage.deleteMany({
      where: { userId: id },
    });

    // 12. Delete system logs related to this user
    await prisma.systemLog.deleteMany({
      where: { userId: id },
    });

    // 13. Delete the user record itself
    const deletedUser = await prisma.user.delete({
      where: { id },
      select: { email: true },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        level: "CRITICAL",
        message: `ADMIN: Permanently wiped all data for deleted user: ${deletedUser.email}`,
        metadata: {
          action: "admin_hard_delete_wipe",
          userId: id,
          email: deletedUser.email,
          timestamp: new Date().toISOString(),
        },
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `User ${deletedUser.email} and all associated data have been permanently wiped.`,
    });
  } catch (error) {
    console.error("Error in admin hard delete:", error);
    return NextResponse.json(
      { error: "Failed to wipe user data" },
      { status: 500 }
    );
  }
}
