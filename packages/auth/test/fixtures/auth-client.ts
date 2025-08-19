import {
  adminClient,
  apiKeyClient,
  customSessionClient,
  inferAdditionalFields,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getDappUrl } from "../../../../kit/dapp/test/fixtures/dapp";
import { pincodeClient } from "../../src/plugins/pincode-plugin/client";
import { secretCodesClient } from "../../src/plugins/secret-codes-plugin/client";
import { twoFactorClient } from "../../src/plugins/two-factor/client";
import type { auth } from "../../src/server";
import { accessControl, adminRole, investorRole, issuerRole } from "../../src/utils/permissions";

export const getTestAuthClient = () =>
  createAuthClient({
    baseURL: `${getDappUrl()}/api/auth`,
    plugins: [
      customSessionClient<typeof auth>(),
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
      pincodeClient(),
      twoFactorClient(),
      secretCodesClient(),
    ],
  });
