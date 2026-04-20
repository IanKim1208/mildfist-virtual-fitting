import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

const SECRET = "mildfist-prototype-secret-2026";
const COOKIE_NAME = "mildfist_session";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createToken(userId: number): string {
  const payload = JSON.stringify({ userId, ts: Date.now() });
  const b64 = Buffer.from(payload).toString("base64");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    if (sign(b64) !== sig) return null;
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number) {
  const token = createToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // prototype
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const db = getDb();
  const user = db
    .prepare("SELECT id, email, name, profile_image, credits, is_admin, is_active, created_at FROM users WHERE id = ?")
    .get(decoded.userId) as {
    id: number;
    email: string;
    name: string;
    profile_image: string | null;
    credits: number;
    is_admin: number;
    is_active: number;
    created_at: string;
  } | undefined;

  return user ?? null;
}

// Synchronous version for API routes that already have the cookie value
export function getUserFromToken(token: string) {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const db = getDb();
  const user = db
    .prepare("SELECT id, email, name, profile_image, credits, is_admin, is_active, created_at FROM users WHERE id = ?")
    .get(decoded.userId) as {
    id: number;
    email: string;
    name: string;
    profile_image: string | null;
    credits: number;
    is_admin: number;
    is_active: number;
    created_at: string;
  } | undefined;

  return user ?? null;
}
