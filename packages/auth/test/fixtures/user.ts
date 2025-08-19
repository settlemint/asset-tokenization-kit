import { getTestOrpcClient } from "@atk/orpc/test/fixtures/orpc-client";
import { zeroAddress } from "viem";
import { getTestAuthClient } from "./auth-client";

export interface User {
  email: string;
  name: string;
  password: string;
}

const DEFAULT_PASSWORD = "settlemint";

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

export async function signInWithUser(user: User) {
  const authClient = getTestAuthClient();
  const newHeaders = new Headers();
  const { error: signInError } = await authClient.signIn.email(
    {
      email: user.email,
      password: user.password,
    },
    {
      onSuccess(context) {
        let cookieFound = false;

        context.response.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie" && value.includes("better-auth.session_token")) {
            cookieFound = true;
            newHeaders.set("Cookie", value);
          }
        });

        if (!cookieFound) {
        }
      },
    }
  );

  if (signInError) {
    throw signInError;
  }
  return newHeaders;
}

export async function setupUser(user: User) {
  const authClient = getTestAuthClient();
  // Step 1: Sign up
  const { error: signUpError } = await authClient.signUp.email(user);

  if (signUpError && signUpError.code !== "USER_ALREADY_EXISTS") {
    throw signUpError;
  }

  // Step 2: Sign in and create wallet if needed
  const signInHeaders = await signInWithUser(user);

  // Check if user needs a wallet
  const sessionBeforeWallet = await authClient.getSession({
    fetchOptions: {
      headers: {
        ...Object.fromEntries(signInHeaders.entries()),
      },
    },
  });

  const userWallet = sessionBeforeWallet.data?.user.wallet;

  if (!userWallet || userWallet === zeroAddress) {
    // Create wallet using the ORPC client
    const orpcClient = getTestOrpcClient(signInHeaders);

    try {
      await orpcClient.user.createWallet({});
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Get fresh headers after wallet creation
    signInWithUser(user);
    // Wallet funding is now handled in wallet.ts createWallet function
  }

  // Step 3: Enable pincode
  const pincodeHeaders = await signInWithUser(user);
  const { error: pincodeError } = await authClient.pincode.enable(
    {
      pincode: DEFAULT_PINCODE,
    },
    {
      headers: {
        ...Object.fromEntries(pincodeHeaders.entries()),
      },
    }
  );

  if (pincodeError && pincodeError.code !== "PINCODE_ALREADY_SET") {
    throw pincodeError;
  }

  // Step 4: Generate secret codes
  const secretCodeHeaders = await signInWithUser(user);
  const { error: secretCodeError } = await authClient.secretCodes.generate(
    {
      password: user.password,
    },
    {
      headers: {
        ...Object.fromEntries(secretCodeHeaders.entries()),
      },
    }
  );

  if (secretCodeError) {
    throw secretCodeError;
  }

  // Step 5: Confirm secret codes
  const confirmSecretCodeHeaders = await signInWithUser(user);
  const { error: confirmSecretCodeError } = await authClient.secretCodes.confirm(
    {
      stored: true,
    },
    {
      headers: {
        ...Object.fromEntries(confirmSecretCodeHeaders.entries()),
      },
    }
  );
  if (confirmSecretCodeError) {
    throw confirmSecretCodeError;
  }

  // Step 6: Check onboarding status
  const sessionHeaders = await signInWithUser(user);
  const session = await authClient.getSession({
    fetchOptions: {
      headers: {
        ...Object.fromEntries(sessionHeaders.entries()),
      },
    },
  });

  if (!(session.data?.user.wallet && session.data?.user.pincodeEnabled && session.data?.user.secretCodesConfirmed)) {
    throw new Error("User is not onboarded");
  }
}

export async function getUserData(user: User) {
  const authClient = getTestAuthClient();
  const headers = await signInWithUser(user);
  const session = await authClient.getSession(
    {},
    {
      headers: {
        ...Object.fromEntries(headers.entries()),
      },
    }
  );
  const userInfo = session.data?.user;
  if (!userInfo) {
    throw new Error(`User ${user.email} not found`);
  }
  return userInfo;
}
