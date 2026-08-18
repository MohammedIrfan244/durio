"use server";

import { withErrorWrapper } from "@/lib/server/error-wrapper";
import { getUserId } from "@/lib/server/get-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const uploadAvatarSchema = z.object({
  file: z.instanceof(File),
});

type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export const uploadAvatar = withErrorWrapper<string, [UploadAvatarInput]>(
  async (input: UploadAvatarInput): Promise<string> => {
    const validatedInput = uploadAvatarSchema.parse(input);
    const userId = await getUserId();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials not configured");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `${process.env.CLOUDINARY_FOLDER_NAME}/avatars/${userId}`;

    // Params to sign (everything except file, api_key, signature, cloud_name)
    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    const signature = await generateSignature(paramsToSign, apiSecret);

    const formData = new FormData();
    formData.append("file", validatedInput.file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

if (!response.ok) {
  let errorMessage = "Profile image upload failed";
  let errorDetails: unknown = undefined;

  try {
    const error = await response.json();
    errorDetails = error;
    errorMessage = error?.error?.message || errorMessage;
  } catch {
    // Response wasn't JSON (e.g. HTML error page from a gateway/timeout)
    errorMessage = await response.text().catch(() => response.statusText);
  }

  console.error("Cloudinary upload error:", {
    status: response.status,
    statusText: response.statusText,
    details: errorDetails,
  });

  throw new Error(`Failed to upload avatar to Cloudinary: ${errorMessage}`);
}

    const result: CloudinaryUploadResult = await response.json();

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: result.secure_url },
    });

    return result.secure_url;
  }
);

export const deleteAvatar = withErrorWrapper<void, []>(
  async (): Promise<void> => {
    const userId = await getUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (user?.avatar) {
      const urlParts = user.avatar.split("/");
      const uploadIndex = urlParts.findIndex((part) => part === "upload");
      if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
        const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = await generateSignature(
            { public_id: publicId, timestamp },
            apiSecret
          );

          const deleteFormData = new FormData();
          deleteFormData.append("public_id", publicId);
          deleteFormData.append("timestamp", timestamp.toString());
          deleteFormData.append("api_key", apiKey);
          deleteFormData.append("signature", signature);

          await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            {
              method: "POST",
              body: deleteFormData,
            }
          ).catch((err) => console.error("Failed to delete from Cloudinary:", err));
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
      });
    }
  }
);

/**
 * Generates a Cloudinary signature.
 * Cloudinary requires params sorted alphabetically by key, joined as key=value&key=value,
 * with the api_secret appended at the end, then SHA-1 hashed.
 */
async function generateSignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  const crypto = await import("crypto");

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const stringToSign = `${sortedParams}${apiSecret}`;
  return crypto.createHash("sha1").update(stringToSign).digest("hex");
}

export const uploadAvatarWithUrl = withErrorWrapper<void, [string]>(
  async (input: string): Promise<void> => {
    const userId = await getUserId();

    if(!input) return;

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: input },
    });
  }
);