import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import type { User } from "./types";

/**
 * Get the currently authenticated user
 * @returns The authenticated user
 * @throws {AuthError} If user is not authenticated
 */
export async function getUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect({ href: "/auth/sign-in", locale: "en" });
      throw new Error("User not authenticated");
    }

    return session.user as User;
  } catch (error) {
    redirect({ href: "/auth/sign-in", locale: "en" });
    throw new Error("User not authenticated");
  }
}
