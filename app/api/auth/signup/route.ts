import { NextResponse } from "next/server";
import { createUser, getUserByEmail, createSession } from "@/lib/db";
import { generateToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { UserRole } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A team member with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      name,
      role: role as UserRole,
    });

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await createSession(user.id, token, expiresAt);
    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user account." },
      { status: 500 }
    );
  }
}
