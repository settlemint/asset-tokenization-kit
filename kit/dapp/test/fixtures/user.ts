import { retryWhenFailed } from "@settlemint/sdk-utils";
import { randomUUID } from "node:crypto";
import { zeroAddress } from "viem";
import { getAuthClient } from "./auth-client";
import { getOrpcClient } from "./orpc-client";

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const DEFAULT_PASSWORD = "settlemint";

export const DEFAULT_PINCODE = "123456";

export const DEFAULT_ADMIN: User = {
  email: "admin@settlemint.com",
  firstName: "admin",
  lastName: "(integration tests)",
  password: DEFAULT_PASSWORD,
};

export const DEFAULT_INVESTOR: User = {
  email: "investor@settlemint.com",
  firstName: "investor",
  lastName: "(integration tests)",
  password: DEFAULT_PASSWORD,
};

export const DEFAULT_ISSUER: User = {
  email: "issuer@settlemint.com",
  firstName: "issuer",
  lastName: "(integration tests)",
  password: DEFAULT_PASSWORD,
};

const SIGN_IN_HEADERS_CACHE = new Map<string, Headers>();

export async function signInWithUser(user: User, bypassCache = false) {
  if (!bypassCache && SIGN_IN_HEADERS_CACHE.has(user.email)) {
    return SIGN_IN_HEADERS_CACHE.get(user.email) as Headers;
  }
  const authClient = getAuthClient();
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
          if (
            key.toLowerCase() === "set-cookie" &&
            value.includes("better-auth.session_token")
          ) {
            cookieFound = true;
            newHeaders.set("Cookie", value);
          }
        });

        if (!cookieFound) {
          console.warn(
            `[signInWithUser] No session cookie found in response headers for ${user.email}`
          );
        }
      },
    }
  );

  if (signInError) {
    console.error(`[signInWithUser] Sign in error for ${user.email}:`, {
      code: signInError.code,
      message: signInError.message,
      status: signInError.status,
      statusText: signInError.statusText,
      fullError: JSON.stringify(signInError, null, 2),
    });
    throw signInError;
  }
  SIGN_IN_HEADERS_CACHE.set(user.email, newHeaders);
  return newHeaders;
}

export const setupUser = (user: User) =>
  retryWhenFailed(
    async () => {
      try {
        const authClient = getAuthClient();
        // Step 1: Sign up
        const { error: signUpError } = await authClient.signUp.email({
          ...user,
          name: `${user.firstName} ${user.lastName}`,
        });

        if (signUpError) {
          if (signUpError.code !== "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
            console.error(`[setupUser] Sign up error for ${user.email}:`, {
              code: signUpError.code,
              message: signUpError.message,
              status: signUpError.status,
              statusText: signUpError.statusText,
              fullError: JSON.stringify(signUpError, null, 2),
            });
            throw signUpError;
          }
        }

        // Step 2: Sign in and create wallet if needed
        const signInHeaders = await signInWithUser(user, true);

        // Check if user needs a wallet
        const sessionBeforeWallet = await authClient.getSession({
          fetchOptions: {
            headers: {
              ...Object.fromEntries(signInHeaders.entries()),
            },
          },
        });

        const isFullyOnboarded =
          !!sessionBeforeWallet.data?.user?.wallet &&
          !!sessionBeforeWallet.data?.user?.pincodeEnabled &&
          !!sessionBeforeWallet.data?.user?.secretCodesConfirmed;

        if (sessionBeforeWallet.data?.user && isFullyOnboarded) {
          return sessionBeforeWallet.data.user;
        }

        const userWallet = sessionBeforeWallet.data?.user.wallet;

        if (!userWallet || userWallet === zeroAddress) {
          // Create wallet using the ORPC client
          const orpcClient = getOrpcClient(signInHeaders);

          try {
            await orpcClient.user.createWallet({});
          } catch (error) {
            console.error(
              `[setupUser] Failed to create wallet for ${user.email}:`,
              {
                error: error instanceof Error ? error.message : "Unknown error",
                fullError: JSON.stringify(error, null, 2),
              }
            );
            throw new Error(
              `Failed to create wallet: ${error instanceof Error ? error.message : "Unknown error"}`
            );
          }
        }

        if (!sessionBeforeWallet.data?.user.pincodeEnabled) {
          // Step 3: Enable pincode
          const pincodeHeaders = await signInWithUser(user, true);
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

          if (pincodeError) {
            if (pincodeError.code !== "PINCODE_ALREADY_SET") {
              console.error(`[setupUser] Pincode error for ${user.email}:`, {
                code: pincodeError.code,
                message: pincodeError.message,
                status: pincodeError.status,
                statusText: pincodeError.statusText,
                fullError: JSON.stringify(pincodeError, null, 2),
              });
              throw pincodeError;
            }
          }
        }

        if (!sessionBeforeWallet.data?.user.secretCodeVerificationId) {
          // Step 4: Generate secret codes
          const secretCodeHeaders = await signInWithUser(user, true);
          const { error: secretCodeError } =
            await authClient.secretCodes.generate(
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
            console.error(
              `[setupUser] Generate secret code error for ${user.email}:`,
              {
                code: secretCodeError.code,
                message: secretCodeError.message,
                status: secretCodeError.status,
                statusText: secretCodeError.statusText,
                fullError: JSON.stringify(secretCodeError, null, 2),
              }
            );
            throw secretCodeError;
          }
        }

        if (!sessionBeforeWallet.data?.user.secretCodesConfirmed) {
          // Step 5: Confirm secret codes
          const confirmSecretCodeHeaders = await signInWithUser(user, true);
          const { error: confirmSecretCodeError } =
            await authClient.secretCodes.confirm(
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
            console.error(
              `[setupUser] Confirm secret code error for ${user.email}:`,
              {
                code: confirmSecretCodeError.code,
                message: confirmSecretCodeError.message,
                status: confirmSecretCodeError.status,
                statusText: confirmSecretCodeError.statusText,
                fullError: JSON.stringify(confirmSecretCodeError, null, 2),
              }
            );
            throw confirmSecretCodeError;
          }
        }

        // Step 6: Check onboarding status
        const sessionHeaders = await signInWithUser(user, true);
        const session = await authClient.getSession({
          fetchOptions: {
            headers: {
              ...Object.fromEntries(sessionHeaders.entries()),
            },
          },
        });

        if (
          !session.data?.user.wallet ||
          !session.data?.user.pincodeEnabled ||
          !session.data?.user.secretCodesConfirmed
        ) {
          console.error(
            `[setupUser] User ${user.email} is not onboarded - full session:`,
            JSON.stringify(session, null, 2)
          );
          throw new Error("User is not onboarded");
        }

        return session.data?.user;
      } catch (err) {
        console.error(`[setupUser] Failed to create user ${user.email}:`, {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
          fullError: JSON.stringify(err, null, 2),
        });
        throw err;
      }
    },
    3,
    30_000 // Most likely we're hitting the rate limits of better auth, wait long enough
  );

export async function getUserData(user: User) {
  const authClient = getAuthClient();
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

export async function getUserWallet(user: User) {
  const userData = await getUserData(user);
  return userData.wallet;
}

export async function createTestUser(firstName = "test", lastName = "") {
  const user: User = {
    email: `${randomUUID()}@test.com`,
    firstName,
    lastName,
    password: DEFAULT_PASSWORD,
  };
  const session = await setupUser(user);
  return { session, user };
}

// Helper function to register user identity
export async function registerUserIdentity(
  adminClient: ReturnType<typeof getOrpcClient>,
  wallet: string
) {
  // Check if identity already exists
  try {
    const identity = await adminClient.system.identity.search(
      { wallet },
      {
        context: {
          skipLoggingFor: ["NOT_FOUND"],
        },
      }
    );
    if (identity?.account) {
      console.log(`Identity already exists for wallet ${wallet}`);
      return;
    }
  } catch {
    // Account doesn't exist yet, which is expected for new wallets
    // We can proceed to create the identity
  }

  // Create identity
  await adminClient.system.identity.create({
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    wallet,
  });

  // Register identity
  await adminClient.system.identity.register({
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
    wallet,
    country: "BE",
  });
}
