import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import type { User } from "./types";

/**
 * Get the currently authenticated user
 * @returns The authenticated user
 * @throws {AuthError} If user is not authenticated
 */
export async function getUser() {
  // Remove logs
  // console.log("Getting user session...");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      unauthorized();
    }

    return session.user as User;
  } catch (error) {
    // Keep error logging for actual errors
    console.error("Error getting user session:", error);
    unauthorized();
  }
}
