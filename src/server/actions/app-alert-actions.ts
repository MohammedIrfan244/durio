"use server";

import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import { revalidatePath } from "next/cache";

export interface CreateAppAlertInput {
  title: string;
  version: string;
  description: string;
  changelog: string[];
  downloadUrl?: string;
  isActive?: boolean;
}

export interface UpdateAppAlertInput {
  title?: string;
  version?: string;
  description?: string;
  changelog?: string[];
  downloadUrl?: string;
  isActive?: boolean;
}

export const getActiveAppAlert = withErrorWrapper(async () => {
  return await prisma.appAlert.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
});

export const getAppAlerts = withErrorWrapper(async () => {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  return await prisma.appAlert.findMany({
    orderBy: { createdAt: "desc" },
  });
});

export const createAppAlert = withErrorWrapper(async (input: CreateAppAlertInput) => {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  if (input.isActive) {
    await prisma.appAlert.updateMany({
      data: { isActive: false },
    });
  }

  const result = await prisma.appAlert.create({
    data: {
      title: input.title,
      version: input.version,
      description: input.description,
      changelog: input.changelog,
      downloadUrl: input.downloadUrl || "/downloads/durio.apk",
      isActive: input.isActive ?? true,
    },
  });

  revalidatePath("/admin/alerts");
  revalidatePath("/settings");
  revalidatePath("/");
  return result;
});

export const toggleAppAlert = withErrorWrapper(async (id: string, isActive: boolean) => {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  if (isActive) {
    await prisma.appAlert.updateMany({
      where: { id: { not: id } },
      data: { isActive: false },
    });
  }

  const result = await prisma.appAlert.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/alerts");
  revalidatePath("/settings");
  revalidatePath("/");
  return result;
});

export const updateAppAlert = withErrorWrapper(async (id: string, input: UpdateAppAlertInput) => {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  if (input.isActive) {
    await prisma.appAlert.updateMany({
      where: { id: { not: id } },
      data: { isActive: false },
    });
  }

  const result = await prisma.appAlert.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.version !== undefined && { version: input.version }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.changelog !== undefined && { changelog: input.changelog }),
      ...(input.downloadUrl !== undefined && { downloadUrl: input.downloadUrl }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });

  revalidatePath("/admin/alerts");
  revalidatePath("/settings");
  revalidatePath("/");
  return result;
});

export const deleteAppAlert = withErrorWrapper(async (id: string) => {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const result = await prisma.appAlert.delete({
    where: { id },
  });

  revalidatePath("/admin/alerts");
  revalidatePath("/settings");
  revalidatePath("/");
  return result;
});
