import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getIronSession, type IronSession } from "iron-session";

export type AdminSession = {
  username?: string;
};

const COOKIE_NAME = "beary_admin_session";
const password = process.env.SESSION_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";

if (password.length < 32) {
  // iron-session requires at least 32 characters. Fall back to a padded key so
  // the app still boots in dev; production must set SESSION_PASSWORD properly.
  console.warn(
    "SESSION_PASSWORD must be at least 32 characters. Using a padded fallback (dev only).",
  );
}

const sessionPassword = password.padEnd(32, "beary-baby-padding");

export async function getAdminSession(): Promise<IronSession<AdminSession>> {
  // Session reads are inherently request-time: iron-session internally uses
  // Date.now() for cookie expiry checks, which is unstable during prerendering.
  // Await connection() so this only runs when a real request comes in.
  await connection();
  const cookieStore = await cookies();
  return getIronSession<AdminSession>(cookieStore, {
    cookieName: COOKIE_NAME,
    password: sessionPassword,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return Boolean(session.username);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return false;
  return username === expectedUser && password === expectedPass;
}
