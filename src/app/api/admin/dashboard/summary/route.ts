import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import { getDashboardSummary } from "@/server/admin-resolvers";

export async function GET() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getDashboardSummary());
  } catch (err) {
    console.error("Failed to get dashboard summary:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}