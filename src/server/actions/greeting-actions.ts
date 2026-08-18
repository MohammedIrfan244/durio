"use server";

import { prisma } from "@/lib/prisma";
import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { revalidatePath } from "next/cache";

export const getActiveGreeting = withErrorWrapper(async () => {
  return await prisma.greetingCard.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
});

export const getGreetings = withErrorWrapper(async () => {
  return await prisma.greetingCard.findMany({
    orderBy: { createdAt: "desc" },
  });
});

export const toggleGreeting = withErrorWrapper(async (id: string, isActive: boolean) => {
  if (isActive) {
    await prisma.greetingCard.updateMany({
      where: { id: { not: id } },
      data: { isActive: false }
    });
  }
  const result = await prisma.greetingCard.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/greetings");
  revalidatePath("/");
  return result;
});

export const deleteGreeting = withErrorWrapper(async (id: string) => {
  const result = await prisma.greetingCard.delete({
    where: { id },
  });
  revalidatePath("/admin/greetings");
  revalidatePath("/");
  return result;
});

export const createGreeting = withErrorWrapper(async (formData: FormData) => {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const file = formData.get("file") as File | null;
  const titleColor = (formData.get("titleColor") as string) || null;
  const descColor = (formData.get("descColor") as string) || null;
  const bgColor = (formData.get("bgColor") as string) || null;
  const giftBoxColor = (formData.get("giftBoxColor") as string) || null;

  if (!title || !description || !file) {
    throw new Error("Missing required fields (title, description, file)");
  }

  // Upload to Cloudinary
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `${process.env.CLOUDINARY_FOLDER_NAME || "Durio"}/greetings`;

  const crypto = await import("crypto");
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("api_key", apiKey);
  uploadFormData.append("timestamp", timestamp.toString());
  uploadFormData.append("folder", folder);
  uploadFormData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadFormData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const result = await response.json();
  const imageUrl = result.secure_url;

  // Set others to inactive
  await prisma.greetingCard.updateMany({
    data: { isActive: false }
  });

  // Create new greeting card
  const card = await prisma.greetingCard.create({
    data: {
      title,
      description,
      imageUrl,
      titleColor,
      descColor,
      bgColor,
      giftBoxColor,
      isActive: true,
    }
  });

  revalidatePath("/admin/greetings");
  revalidatePath("/");
  
  return card;
});
