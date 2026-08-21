import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/get-user";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const media = await prisma.media.findFirst({
    where: { id, userId },
    select: { url: true, filename: true, mimeType: true },
  });

  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const response = await fetch(media.url);
  if (!response.ok || !response.body) {
    return new NextResponse("Unable to fetch media", { status: 502 });
  }

  const filename = media.filename.replace(/[\\"\r\n]/g, "_");
  return new NextResponse(response.body, {
    headers: {
      "Content-Type": media.mimeType || response.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}