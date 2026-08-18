import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import type { AdminRecord } from "@/types/admin";

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
] as const;

type AdminModelKey = typeof allowed[number];
type AdminWhere = Record<string, unknown>;

interface AdminModelClient {
  findUnique(args: { where: { id: string } }): Promise<AdminRecord | null>;
  findMany(args: { where: AdminWhere; take: number; skip: number }): Promise<AdminRecord[]>;
}

const adminModelClients: Record<AdminModelKey, AdminModelClient> = {
  user: prisma.user,
  todo: prisma.todo,
  checklistitem: prisma.checklistItem,
  todolist: prisma.todo,
  todostreak: prisma.todoStreak,
  note: prisma.note,
  notefolder: prisma.noteFolder,
  notification: prisma.notification,
  event: prisma.event,
  eventcategory: prisma.eventCategory,
  routineblock: prisma.routineBlock,
  blocklog: prisma.blockLog,
  resourcelink: prisma.resourceLink,
  aiusage: prisma.aIUsage,
  systemlog: prisma.systemLog,
  systemconfig: prisma.systemConfig,
};

function modelKey(name: string) {
  return name.toLowerCase();
}

function isAdminModelKey(key: string): key is AdminModelKey {
  return allowed.includes(key as AdminModelKey);
}

export async function GET(request: Request, { params }: { params: Promise<{ model: string }> }) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { model } = await params;
  if (!model) return NextResponse.json({ error: "Missing model" }, { status: 400 });

  const key = modelKey(model);
  if (!isAdminModelKey(key)) return NextResponse.json({ error: "Model not allowed" }, { status: 404 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const id = url.searchParams.get("id");

  try {
    const client = adminModelClients[key];
    if (!client) return NextResponse.json({ error: "Model client not found" }, { status: 404 });

    if (id) {
      const rec = await client.findUnique({ where: { id } });
      return NextResponse.json({ records: rec ? [rec] : [] });
    }

    let where: AdminWhere = {};
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
