import {
  adminClient,
  inferAdditionalFields,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getServerEnvironment } from "../config/environment";
import type { auth } from "./auth";

/**
 * The authentication client instance with configured plugins
 */
export const authClient = createAuthClient({
  baseURL: getServerEnvironment().APP_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    passkeyClient(),
  ],
});
