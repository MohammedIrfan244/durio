"use server";

import { getServerSession } from "next-auth";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getUser = cache(async () => {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    return user;
  } catch (error) {
    throw error;
  }
});

export async function getUserId(): Promise<string> {
  const user = await getUser();
  return user.id;
}
