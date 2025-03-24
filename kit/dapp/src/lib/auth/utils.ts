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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return unauthorized();
  }

  return session.user as User;
}
