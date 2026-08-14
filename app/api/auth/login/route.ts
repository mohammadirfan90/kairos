import { NextResponse } from "next/server";
import { getUserByEmail, createSession } from "@/lib/db";
import { generateToken, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const userWithHash = await getUserByEmail(email);
    if (!userWithHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, userWithHash.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await createSession(userWithHash.id, token, expiresAt);
    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      success: true,
      data: {
        id: userWithHash.id,
        email: userWithHash.email,
        name: userWithHash.name,
        role: userWithHash.role,
        avatarUrl: userWithHash.avatarUrl,
        createdAt: userWithHash.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log in." },
      { status: 500 }
    );
  }
}
