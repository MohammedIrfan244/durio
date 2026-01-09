"use server";

import { withErrorWrapper, AppError } from "@/lib/server/error-wrapper";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { z } from "zod";

const updateUserProfileSchema = z.object({
  timezone: z.string().optional(),
  displayName: z.string().optional(),
});

type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export const updateUserProfile = withErrorWrapper<void, [UpdateUserProfileInput]>(
  async (input: UpdateUserProfileInput): Promise<void> => {
    const validatedInput = updateUserProfileSchema.parse(input);
    const userId = await getUserId();

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedInput,
      },
    });
  }
);
