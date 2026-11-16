import { NextRequest, NextResponse } from "next/server";
import { runGlobalNotificationChecks } from "@/server/actions/notification-actions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce authorization
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const result = await runGlobalNotificationChecks();

    return NextResponse.json({
      success: true,
      message: `Checked notifications for ${result.processedUsers} users`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
