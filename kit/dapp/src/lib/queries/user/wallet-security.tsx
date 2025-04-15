"use server";

import { redirectToSignIn } from "@/lib/auth/redirect";
import { getUser } from "@/lib/auth/utils";
import { withTracing } from "@/lib/utils/tracing";
import { getLocale } from "next-intl/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Checks if the logged in user has a wallet verification
 *
 * @returns True if the user has a wallet verification, false otherwise
 */
export const hasWalletVerification = withTracing(
  "queries",
  "hasWalletVerification",
  async () => {
    try {
      const user = await getUser();
      return user.pincodeEnabled || user.twoFactorEnabled || false;
    } catch (err) {
      const error = err as Error;
      if (isRedirectError(error)) {
        throw error;
      }
      console.error(
        `Error getting wallet verification: ${error.message}`,
        error.stack
      );
      const locale = await getLocale();
      return redirectToSignIn(locale);
    }
  }
);
