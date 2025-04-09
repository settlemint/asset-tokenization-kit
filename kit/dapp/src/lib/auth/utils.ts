import { auth } from "@/lib/auth/auth";
import { redirectToSignIn } from "@/lib/auth/redirect";
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
      query: {
        // Don't use the cookie cache, some setting like pincode are not updated in the cookie (only after logout/login)
        disableCookieCache: true,
      },
    });

    if (!session?.user) {
      return redirectToSignIn();
    }

    return session.user as User;
  } catch (err) {
    const error = err as Error;
    console.error(`Error getting user: ${error.message}`, error.stack);
    return redirectToSignIn();
  }
}
