"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSession,
  deleteSession,
  validateCredentials,
  getSession,
} from "@/lib/auth";
import { addRequest, markRequestDone, RequestType } from "@/lib/store";

export async function login(
  _prevState: { error: string },
  formData: FormData
) {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  const user = await validateCredentials(username, password);
  if (!user) {
    return { error: "Invalid username or password" };
  }

  await createSession(user);
  redirect(user.role === "fareed" ? "/fareed" : "/employee");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function sendRequest(
  _prevState: { success: boolean; error: string },
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated" };

  const type = formData.get("type") as RequestType;
  const instructions =
    (formData.get("instructions") as string | null)?.trim() || undefined;

  if ((type === "food" || type === "custom") && !instructions) {
    return { success: false, error: "Please provide details." };
  }

  await addRequest({ type, username: session.username, instructions });
  revalidatePath("/fareed");
  revalidatePath("/employee");
  return { success: true, error: "" };
}

export async function markDone(id: string) {
  await markRequestDone(id);
  revalidatePath("/fareed");
}
