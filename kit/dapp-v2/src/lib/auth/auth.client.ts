import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from ".";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    apiKeyClient(),
    passkeyClient(),
  ],
});
