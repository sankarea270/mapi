import { cookies } from "next/headers";

const SESSION_COOKIE = "mapi-admin-session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function validateAdminCredentials(
  user: string,
  pass: string
): Promise<boolean> {
  const adminUser = process.env.ADMIN_USER ?? "admin";
  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass) return false;
  return timingSafeEqual(user, adminUser) && timingSafeEqual(pass, adminPass);
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function removeSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return Boolean(session?.value);
}
