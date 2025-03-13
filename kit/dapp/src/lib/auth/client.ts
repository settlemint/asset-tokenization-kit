import {
  adminClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

/**
 * The authentication client instance with configured plugins
 */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    passkeyClient(),
    magicLinkClient(),
    multiSessionClient(),
  ],
});
