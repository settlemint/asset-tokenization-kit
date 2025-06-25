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
  const { error: signInError } = await authClient.signIn.email(
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
  if (signInError) {
    throw signInError;
  }
  return newHeaders;
}

export async function setupUser(user: User) {
  try {
    const { error: signUpError } = await authClient.signUp.email(user);
    if (signUpError && signUpError.code !== "USER_ALREADY_EXISTS") {
      throw signUpError;
    }
    const { error: walletError } = await authClient.wallet(
      { messages: {} },
      {
        headers: await signInWithUser(user),
      }
    );
    if (walletError && walletError.code !== "USER_WALLET_ALREADY_EXISTS") {
      throw walletError;
    }
    const { error: pincodeError } = await authClient.pincode.enable(
      {
        pincode: DEFAULT_PINCODE,
      },
      { headers: await signInWithUser(user) }
    );
    if (pincodeError && pincodeError.code !== "PINCODE_ALREADY_SET") {
      throw pincodeError;
    }
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await signInWithUser(user),
      },
    });
    if (!session.data?.user.initialOnboardingFinished) {
      throw new Error("User is not onboarded");
    }
  } catch (err) {
    console.error(`Failed to create user ${user.email} `, err);
    throw err;
  }
}
