import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/server/actions/admin-auth";

const allowed = [
  "user",
  "todo",
  "checklistitem",
  "todolist",
  "todostreak",
  "note",
  "notefolder",
  "notification",
  "event",
  "eventcategory",
  "routineblock",
  "blocklog",
  "resourcelink",
  "aiusage",
  "systemlog",
  "systemconfig",
];

function modelKey(name: string) {
  return name.toLowerCase();
}

export async function GET(request: Request, { params }: { params: Promise<{ model: string }> }) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { model } = await params;
  if (!model) return NextResponse.json({ error: "Missing model" }, { status: 400 });

  const key = modelKey(model);
  if (!allowed.includes(key)) return NextResponse.json({ error: "Model not allowed" }, { status: 404 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const id = url.searchParams.get("id");

  try {
    // Dynamic access to prisma model
    // @ts-expect-error the reason is I have configured these models in the prisma schema
    const client = prisma[key];
    if (!client) return NextResponse.json({ error: "Model client not found" }, { status: 404 });

    if (id) {
      const rec = await client.findUnique({ where: { id } });
      return NextResponse.json({ records: rec ? [rec] : [] });
    }

    let where: any = {};
    if (q) {
      // If q looks like an ObjectId (24 hex chars) search by id
      if (/^[0-9a-fA-F]{24}$/.test(q)) {
        where = { id: q };
      } else if (key === "user") {
        where = { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] };
      } else if (key === "todo") {
        where = { title: { contains: q, mode: "insensitive" } };
      } else if (key === "note") {
        where = { heading: { contains: q, mode: "insensitive" } };
      } else {
        // fallback: try userId match
        where = { OR: [{ userId: q }, { id: q }] };
      }
    }

    const records = await client.findMany({ where, take: limit, skip: (page - 1) * limit });
    return NextResponse.json({ records });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
