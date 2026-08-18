"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import type { RoutineBlock } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type {
  DeleteFocusBlockInput,
  FocusBlockInput,
  FocusBlockLogInput,
  FocusBlockWithNoteTitle,
  UpdateFocusBlockInput,
} from "@/types/focus";

export const createFocusBlock = withErrorWrapper<RoutineBlock, [FocusBlockInput]>(async (data) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const block = await prisma.routineBlock.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: data.daysOfWeek || [0, 1, 2, 3, 4, 5, 6], // default all days
        energyLevel: data.energyLevel || "MEDIUM",
        priority: data.priority || "MEDIUM",
        transitionRitual: data.transitionRitual,
        color: data.color,
        icon: data.icon,
        linkedNoteId: data.linkedNoteId || null,
        isActive: data.isActive !== false,
      },
    });

    revalidatePath("/focus");
    revalidatePath("/dashboard");
    return block;
});

export const updateFocusBlock = withErrorWrapper<RoutineBlock, [UpdateFocusBlockInput]>(async (data) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const { id, ...updateData } = data;
    
    // Ensure block belongs to user
    const existing = await prisma.routineBlock.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error("Not found or unauthorized");
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
    return block;
});

export const deleteFocusBlock = withErrorWrapper<void, [DeleteFocusBlockInput]>(async (data) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const existing = await prisma.routineBlock.findUnique({ where: { id: data.id } });
    if (!existing || existing.userId !== userId) {
      throw new Error("Not found or unauthorized");
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
});

export const getFocusBlocksForAI = withErrorWrapper<RoutineBlock[], [{ limit?: number } | undefined]>(async (params) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const blocks = await prisma.routineBlock.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
      take: params?.limit || 50,
    });

    return blocks;
});

export const getFocusBlockById = withErrorWrapper<RoutineBlock, [{ id: string }]>(async ({ id }) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

    const block = await prisma.routineBlock.findUnique({
      where: { id },
    });

    if (!block || block.userId !== userId) {
      throw new Error("Not found or unauthorized");
    }

    return block;
});

export const getTodaysFocusBlocks = withErrorWrapper<FocusBlockWithNoteTitle[], []>(async () => {
    const userId = await getUserId();
    if (!userId) return [];
    
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

    return blocksWithNotes;
});

export const getPendingReviews = withErrorWrapper<RoutineBlock[], []>(async () => {
    const userId = await getUserId();
    if (!userId) return [];

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

    if (blocks.length === 0) return [];

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

    return pendingBlocks;
});

export const saveBlockLogs = withErrorWrapper<void, [FocusBlockLogInput[]]>(async (logsData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");

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
});

export const getReviewTimeConfig = withErrorWrapper<string, []>(async () => {
    const userId = await getUserId();
    if (!userId) return "21:00";
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { endOfDayReviewTime: true } });
    return user?.endOfDayReviewTime || "21:00";
});

export const updateReviewTimeConfig = withErrorWrapper<void, [string]>(async (time) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Unauthorized");
    await prisma.user.update({
      where: { id: userId },
      data: { endOfDayReviewTime: time }
    });
});
