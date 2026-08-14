import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/db";
import { clearSessionCookie, getSessionTokenFromCookies } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getSessionTokenFromCookies();
    if (token) {
      await deleteSession(token);
    }
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log out." },
      { status: 500 }
    );
  }
}
