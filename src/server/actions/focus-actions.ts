"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { Priority } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createFocusBlock(data: any) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const block = await prisma.routineBlock.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: data.daysOfWeek || [0, 1, 2, 3, 4, 5, 6], // default all days
        energyLevel: data.energyLevel || "MEDIUM",
        priority: (data.priority as Priority) || "MEDIUM",
        transitionRitual: data.transitionRitual,
        color: data.color,
        icon: data.icon,
        linkedNoteId: data.linkedNoteId || null,
        isActive: data.isActive !== false,
      },
    });

    revalidatePath("/focus");
    revalidatePath("/dashboard");
    return { success: true, data: block };
  } catch (error: any) {
    console.error("Error creating focus block:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFocusBlock(data: any) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const { id, ...updateData } = data;
    
    // Ensure block belongs to user
    const existing = await prisma.routineBlock.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const block = await prisma.routineBlock.update({
      where: { id },
      data: {
        ...updateData,
        linkedNoteId: updateData.linkedNoteId ?? null,
      },
    });

    revalidatePath("/focus");
    revalidatePath("/dashboard");
    return { success: true, data: block };
  } catch (error: any) {
    console.error("Error updating focus block:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFocusBlock(data: { id: string; reason?: string }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const existing = await prisma.routineBlock.findUnique({ where: { id: data.id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Not found or unauthorized" };
    }

    // Delete associated logs first
    await prisma.blockLog.deleteMany({
      where: { routineBlockId: data.id },
    });

    await prisma.routineBlock.delete({
      where: { id: data.id },
    });

    revalidatePath("/focus");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting focus block:", error);
    return { success: false, error: error.message };
  }
}

export async function getFocusBlocksForAI(params?: { limit?: number }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const blocks = await prisma.routineBlock.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
      take: params?.limit || 50,
    });

    return { success: true, data: blocks };
  } catch (error: any) {
    console.error("Error fetching focus blocks for AI:", error);
    return { success: false, error: error.message };
  }
}

export async function getFocusBlockById({ id }: { id: string }) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const block = await prisma.routineBlock.findUnique({
      where: { id },
    });

    if (!block || block.userId !== userId) {
      return { success: false, error: "Not found or unauthorized" };
    }

    return { success: true, data: block };
  } catch (error: any) {
    console.error("Error fetching focus block:", error);
    return { success: false, error: error.message };
  }
}

export async function getTodaysFocusBlocks() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, data: [] };
    
    const now = new Date();
    const blocks = await prisma.routineBlock.findMany({
      where: {
        userId,
        isActive: true,
        daysOfWeek: { has: now.getDay() },
      },
      orderBy: { startTime: 'asc' }
    });

    const linkedNoteIds = blocks
      .map((block) => block.linkedNoteId)
      .filter((id): id is string => Boolean(id));

    const notes = linkedNoteIds.length > 0
      ? await prisma.note.findMany({
          where: { id: { in: linkedNoteIds } },
          select: { id: true, heading: true },
        })
      : [];

    const noteMap = new Map(notes.map((note) => [note.id, note.heading]));

    const blocksWithNotes = blocks.map((block) => ({
      ...block,
      linkedNoteTitle: block.linkedNoteId ? noteMap.get(block.linkedNoteId) ?? null : null,
    }));

    return { success: true, data: blocksWithNotes };
  } catch (error: any) {
    console.error("Error fetching today's focus blocks:", error);
    return { success: false, data: [] };
  }
}

export async function getPendingReviews() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, data: [] };

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayDayOfWeek = yesterday.getDay();

    // Get all blocks that were active yesterday
    const blocks = await prisma.routineBlock.findMany({
      where: {
        userId,
        isActive: true,
        daysOfWeek: { has: yesterdayDayOfWeek },
      }
    });

    if (blocks.length === 0) return { success: true, data: [] };

    // Get existing logs for yesterday
    const logs = await prisma.blockLog.findMany({
      where: {
        routineBlockId: { in: blocks.map(b => b.id) },
        date: {
          gte: yesterday,
          lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    const loggedBlockIds = new Set(logs.map(l => l.routineBlockId));
    const pendingBlocks = blocks.filter(b => !loggedBlockIds.has(b.id));

    return { success: true, data: pendingBlocks };
  } catch (error: any) {
    console.error("Error fetching pending reviews:", error);
    return { success: false, data: [] };
  }
}

export async function saveBlockLogs(logsData: { routineBlockId: string, status: string, flowPoints: number }[]) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const creations = logsData.map(log => 
      prisma.blockLog.create({
        data: {
          routineBlockId: log.routineBlockId,
          date: yesterday,
          status: log.status,
          flowPoints: log.flowPoints
        }
      })
    );

    await prisma.$transaction(creations);
    
    // Add logic to update some overall gamification score on User if desired
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving block logs:", error);
    return { success: false, error: error.message };
  }
}
