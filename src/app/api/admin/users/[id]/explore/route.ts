import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const email = user.email;

  try {
    const [
      todosByUser,
      notesByUser,
      notificationsByUser,
      eventsByUser,
      resourceLinksByUser,
      routineBlocksByUser,
      blockLogsByUser,
      checklistItemsByUser,
      systemLogsByUser,
      todosByText,
      notesByText,
      systemLogsByText,
    ] = await Promise.all([
      prisma.todo.findMany({ where: { userId: id }, take: 50 }),
      prisma.note.findMany({ where: { userId: id }, take: 50 }),
      prisma.notification.findMany({ where: { userId: id }, take: 50 }),
      prisma.event.findMany({ where: { userId: id }, take: 50 }),
      prisma.resourceLink.findMany({ where: { userId: id }, take: 50 }),
      prisma.routineBlock.findMany({ where: { userId: id }, take: 50 }),
      prisma.blockLog.findMany({ where: { routineBlock: { is: { userId: id } } }, take: 50 }),
      prisma.checklistItem.findMany({ where: { todo: { is: { userId: id } } }, take: 50 }),
      prisma.systemLog.findMany({ where: { OR: [{ userId: id }, { message: { contains: email } }, { metadata: { equals: { userId: id } } }] }, orderBy: { createdAt: "desc" }, take: 100 }),

      // text-based searches for email occurrences
      prisma.todo.findMany({ where: { OR: [{ title: { contains: email, mode: "insensitive" } }, { description: { contains: email, mode: "insensitive" } }] }, take: 20 }),
      prisma.note.findMany({ where: { OR: [{ heading: { contains: email, mode: "insensitive" } }, { description: { contains: email, mode: "insensitive" } }] }, take: 20 }),
      prisma.systemLog.findMany({ where: { OR: [{ message: { contains: email, mode: "insensitive" } }, { metadata: { equals: { message: email } } }] }, take: 50 }),
    ]);

    const result = {
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      counts: {
        todos: await prisma.todo.count({ where: { userId: id } }),
        notes: await prisma.note.count({ where: { userId: id } }),
        notifications: await prisma.notification.count({ where: { userId: id } }),
        events: await prisma.event.count({ where: { userId: id } }),
        resourceLinks: await prisma.resourceLink.count({ where: { userId: id } }),
        routineBlocks: await prisma.routineBlock.count({ where: { userId: id } }),
      },
      samples: {
        todosByUser,
        notesByUser,
        notificationsByUser,
        eventsByUser,
        resourceLinksByUser,
        routineBlocksByUser,
        blockLogsByUser,
        checklistItemsByUser,
        systemLogsByUser,
        todosByText,
        notesByText,
        systemLogsByText,
      },
    };

    // Audit
    try {
      await prisma.systemLog.create({ data: { level: "INFO", message: `Admin explored user ${id}`, userId: id, metadata: { userId: id }, createdAt: new Date() } });
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
