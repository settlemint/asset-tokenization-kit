import {
  accessControl,
  adminRole,
  investorRole,
  issuerRole,
} from "@/lib/auth/permissions";
import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  magicLinkClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { BetterFetchError, createAuthClient } from "better-auth/react";
import type { Session } from "better-auth/types";
import type { auth } from "./auth";
import { pincodeClient } from "./plugins/pincode-plugin/client";
import { secretCodesClient } from "./plugins/secret-codes-plugin/client";
import type { User } from "./types";

/**
 * The authentication client instance with configured plugins
 */
const client = createAuthClient({
  basePath: "/api/auth",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac: accessControl,
      roles: {
        admin: adminRole,
        investor: investorRole,
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
    pincodeClient(),
    secretCodesClient(),
    magicLinkClient(),
  ],
});

export const authClient = client as Omit<typeof client, "useSession"> & {
  useSession: () => {
    data: {
      user: User;
      session: Session;
    };
    isPending: boolean;
    error: BetterFetchError;
    refetch: () => void;
  };
};
