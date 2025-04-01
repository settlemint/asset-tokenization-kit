import {
  accessControl,
  adminRole,
  issuerRole,
  userRole,
} from "@/lib/auth/permissions";
import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  magicLinkClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

/**
 * The authentication client instance with configured plugins
 */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac: accessControl,
      roles: {
        admin: adminRole,
        user: userRole,
        issuer: issuerRole,
      },
    }),
    apiKeyClient(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect: async () => {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const locale = pathParts[0] ?? "en";
        const queryParams = window.location.search;
        window.location.href = `/${locale}/auth/2fa${queryParams}`; // Handle the 2FA verification redirect
      },
    }),
    magicLinkClient(),
  ],
});
