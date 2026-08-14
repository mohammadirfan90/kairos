import { NextResponse } from "next/server";
import { getProjectActivityLogs } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logs = await getProjectActivityLogs(id);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Failed to fetch project activity logs:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
