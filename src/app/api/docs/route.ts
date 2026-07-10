import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getUserId } from "@/lib/server/get-user";

export async function GET(req: NextRequest) {
  try {
    // Basic auth check to ensure only logged in users can access docs
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const docPath = searchParams.get("path");

    if (!docPath) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    // Ensure it only reads from the docs directory to prevent path traversal
    const safePath = path.join(process.cwd(), docPath);
    if (!safePath.startsWith(path.join(process.cwd(), "docs"))) {
        return NextResponse.json({ error: "Invalid path" }, { status: 403 });
    }

    const content = await fs.readFile(safePath, "utf-8");
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error reading doc:", error);
    return NextResponse.json({ error: "Failed to read document" }, { status: 500 });
  }
}
