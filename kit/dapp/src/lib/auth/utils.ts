import { auth } from "@/lib/auth/auth";
import { redirectToSignIn } from "@/lib/auth/redirect";
import { withTracing } from "@/lib/utils/tracing";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import { cache } from "react";
import type { User } from "./types";

/**
 * Get the currently authenticated user
 * @returns The authenticated user
 * @throws {AuthError} If user is not authenticated
 */
export const getUser = withTracing(
  "queries",
  "getUser",
  cache(async () => {
    const locale = await getLocale();
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session?.user) {
        return redirectToSignIn(locale);
      }
      return session.user as User;
    } catch (err) {
      const error = err as Error;
      console.error(`Error getting user: ${error.message}`, error.stack);
      return redirectToSignIn(locale);
    }
  })
);
