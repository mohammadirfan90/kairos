import crypto from "crypto";
import { cookies } from "next/headers";
import { User, AuthSession } from "./types";
import { createSession, deleteSession, getSessionByToken, getUserById } from "./db";

const SESSION_COOKIE_NAME = "kairos_session_token";
const SESSION_MAX_AGE_DAYS = 30;

// Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

// Generate secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Issue session cookie
export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

// Remove session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Get current session token from cookies
export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token || null;
}

// Get currently authenticated user in server components / route handlers
export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const session = await getSessionByToken(token);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt) < new Date()) {
    await deleteSession(token);
    await clearSessionCookie();
    return null;
  }

  const user = await getUserById(session.userId);
  return user;
}
