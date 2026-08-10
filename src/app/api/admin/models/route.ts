import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/server/actions/admin-auth";

export async function GET() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Minimal model list for DB Explorer
  const models = [
    "User",
    "Todo",
    "ChecklistItem",
    "TodoStreak",
    "Note",
    "NoteFolder",
    "Notification",
    "Event",
    "EventCategory",
    "RoutineBlock",
    "BlockLog",
    "ResourceLink",
    "AIUsage",
    "SystemLog",
    "SystemConfig",
  ];

  return NextResponse.json({ models });
}
