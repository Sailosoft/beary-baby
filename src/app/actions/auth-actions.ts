"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import {
  getAdminSession,
  verifyCredentials,
} from "@/infrastructure/auth/session";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(username, password)) {
    return { error: "Invalid username or password." };
  }

  const session = await getAdminSession();
  session.username = username;
  await session.save();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const session = await getAdminSession();
  session.destroy();
  redirect("/");
}

export async function requireAdmin(): Promise<string> {
  const session = await getAdminSession();
  if (!session.username) {
    redirect("/login");
  }
  return session.username;
}

/** Revalidate catalog caches after admin mutations. */
export async function revalidateCatalog(): Promise<void> {
  revalidateTag("catalog", "max");
}
