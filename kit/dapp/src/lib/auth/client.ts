import {
  adminClient,
  inferAdditionalFields,
  magicLinkClient,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getEnvironment } from "../config/environment";
import type { auth } from "./auth";

/**
 * Gets the base URL for the auth client
 * @returns The base URL to use for authentication
 */
const getBaseURL = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const env = getEnvironment();
  return env.BETTER_AUTH_URL;
};

/**
 * The authentication client instance with configured plugins
 */
export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    passkeyClient(),
    magicLinkClient(),
  ],
});
