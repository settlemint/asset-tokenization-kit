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

    // console.log("Session result:", JSON.stringify(session, null, 2));

    if (!session?.user) {
      // console.log("No user in session, redirecting to login");
      unauthorized();
    }

    // Remove checks/logs for wallet
    // if (!session.user.wallet) {
    //   console.log("User session found but no wallet address is present");
    // } else if (typeof session.user.wallet !== 'string' || !session.user.wallet.startsWith('0x')) {
    //   console.log("User has a wallet but it's not a valid Ethereum address:", session.user.wallet);
    // }

    return session.user as User;
  } catch (error) {
    // Keep error logging for actual errors
    console.error("Error getting user session:", error);
    unauthorized();
  }
}
