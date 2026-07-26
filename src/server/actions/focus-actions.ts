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
      data: updateData,
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
