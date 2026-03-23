"use server";

import { cookies } from "next/headers";

export async function authenticateAdmin(passphrase: string) {
  // This stays on the server and is never sent to the browser
  const correctPassphrase = process.env.ADMIN_PASSPHRASE;

  if (passphrase === correctPassphrase) {
    // Set a simple encrypted-style session cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return { success: true };
  }

  return { success: false, error: "Invalid Credentials" };
}
