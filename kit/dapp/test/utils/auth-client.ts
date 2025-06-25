import type { auth } from "@/lib/auth";
import {
  accessControl,
  adminRole,
  investorRole,
  issuerRole,
} from "@/lib/auth/permissions";
import { pincodeClient } from "@/lib/auth/plugins/pincode-plugin/client";
import { secretCodesClient } from "@/lib/auth/plugins/secret-codes-plugin/client";
import { twoFactorClient } from "@/lib/auth/plugins/two-factor/client";
import { walletClient } from "@/lib/auth/plugins/wallet-plugin/client";
import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const DEFAULT_PASSWORD = "settlemint";

interface User {
  email: string;
  name: string;
  password: string;
}

export const DEFAULT_PINCODE = "123456";

export const DEFAULT_ADMIN: User = {
  email: "admin@test.com",
  name: "admin",
  password: DEFAULT_PASSWORD,
};

export const DEFAULT_INVESTOR: User = {
  email: "investor@test.com",
  name: "investor",
  password: DEFAULT_PASSWORD,
};

export const DEFAULT_ISSUER: User = {
  email: "issuer@test.com",
  name: "issuer",
  password: DEFAULT_PASSWORD,
};

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/auth",
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
    pincodeClient(),
    twoFactorClient(),
    secretCodesClient(),
    walletClient(),
  ],
});

export async function signInWithUser(user: User) {
  const newHeaders = new Headers();
  await authClient.signIn.email(
    {
      email: user.email,
      password: user.password,
    },
    {
      onSuccess(context) {
        context.response.headers.forEach((value, key) => {
          if (
            key.toLowerCase() === "set-cookie" &&
            value.includes("better-auth.session_token")
          ) {
            newHeaders.set("Cookie", value);
          }
        });
      },
    }
  );
  return newHeaders;
}

export async function createUserIfNotExists(user: User) {
  await authClient.signUp.email(user);
}
