import type { auth } from "@/lib/auth";
import { pincodeClient } from "@/lib/auth/plugins/pincode-plugin/client";
import { secretCodesClient } from "@/lib/auth/plugins/secret-codes-plugin/client";
import { twoFactorClient } from "@/lib/auth/plugins/two-factor/client";
import {
  accessControl,
  adminRole,
  userRole,
} from "@/lib/auth/utils/permissions";
import {
  adminClient,
  apiKeyClient,
  customSessionClient,
  inferAdditionalFields,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getDappUrl } from "./dapp";

export const getAuthClient = () =>
  createAuthClient({
    baseURL: `${getDappUrl()}/api/auth`,
    plugins: [
      customSessionClient<typeof auth>(),
      inferAdditionalFields<typeof auth>(),
      adminClient({
        ac: accessControl,
        roles: {
          admin: adminRole,
          user: userRole,
        },
      }),
      apiKeyClient(),
      passkeyClient(),
      pincodeClient(),
      twoFactorClient(),
      secretCodesClient(),
    ],
  });
