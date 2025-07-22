import { authClient } from "./auth-client";
import { getOrpcClient } from "./orpc-client";

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
  console.log(`[signInWithUser] Attempting to sign in user: ${user.email}`);

  const newHeaders = new Headers();
  const { error: signInError } = await authClient.signIn.email(
    {
      email: user.email,
      password: user.password,
    },
    {
      onSuccess(context) {
        console.log(
          `[signInWithUser] Sign in successful for ${user.email}, processing headers`
        );
        let cookieFound = false;

        context.response.headers.forEach((value, key) => {
          if (
            key.toLowerCase() === "set-cookie" &&
            value.includes("better-auth.session_token")
          ) {
            cookieFound = true;
            newHeaders.set("Cookie", value);
            console.log(
              `[signInWithUser] Session cookie set for ${user.email}`
            );
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

  console.log(
    `[signInWithUser] Successfully obtained headers for ${user.email}`
  );
  return newHeaders;
}

export async function setupUser(user: User) {
  console.log(`[setupUser] Starting setup for user: ${user.email}`);

  try {
    // Step 1: Sign up
    console.log(`[setupUser] Step 1: Attempting to sign up user ${user.email}`);
    const { error: signUpError } = await authClient.signUp.email(user);

    if (signUpError) {
      if (signUpError.code !== "USER_ALREADY_EXISTS") {
        console.log(`[setupUser] Sign up error for ${user.email}:`, {
          code: signUpError.code,
          message: signUpError.message,
          status: signUpError.status,
          statusText: signUpError.statusText,
          fullError: JSON.stringify(signUpError, null, 2),
        });
        throw signUpError;
      }
      console.log(
        `[setupUser] User ${user.email} already exists, continuing...`
      );
    } else {
      console.log(`[setupUser] Successfully signed up user ${user.email}`);
    }

    // Step 2: Sign in and create wallet if needed
    console.log(
      `[setupUser] Step 2: Signing in user ${user.email} to check wallet status`
    );
    const signInHeaders = await signInWithUser(user);
    console.log(
      `[setupUser] Sign in successful for ${user.email}, headers obtained`
    );

    // Check if user needs a wallet
    console.log(
      `[setupUser] Step 2.5: Checking wallet status for ${user.email}`
    );
    const sessionBeforeWallet = await authClient.getSession({
      fetchOptions: {
        headers: signInHeaders,
      },
    });

    const userWallet = sessionBeforeWallet.data?.user.wallet;
    console.log(`[setupUser] User ${user.email} wallet: ${userWallet}`);

    if (
      !userWallet ||
      userWallet === "0x0000000000000000000000000000000000000000"
    ) {
      console.log(
        `[setupUser] User ${user.email} needs a wallet, creating one...`
      );

      // Create wallet using the ORPC client
      const orpcClient = getOrpcClient(signInHeaders);

      try {
        const walletData = await orpcClient.user.createWallet({});
        console.log(
          `[setupUser] Successfully created wallet for ${user.email}:`,
          walletData
        );
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

      // Get fresh headers after wallet creation
      const freshHeaders = await signInWithUser(user);

      // Verify wallet was created
      const sessionAfterWallet = await authClient.getSession({
        fetchOptions: {
          headers: freshHeaders,
        },
      });
      console.log(
        `[setupUser] User ${user.email} wallet after creation: ${sessionAfterWallet.data?.user.wallet}`
      );
    }

    // Step 3: Enable pincode
    console.log(`[setupUser] Step 3: Enabling pincode for user ${user.email}`);
    const pincodeHeaders = await signInWithUser(user);
    const { error: pincodeError } = await authClient.pincode.enable(
      {
        pincode: DEFAULT_PINCODE,
      },
      { headers: pincodeHeaders }
    );

    if (pincodeError) {
      if (pincodeError.code !== "PINCODE_ALREADY_SET") {
        console.log(`[setupUser] Pincode error for ${user.email}:`, {
          code: pincodeError.code,
          message: pincodeError.message,
          status: pincodeError.status,
          statusText: pincodeError.statusText,
          fullError: JSON.stringify(pincodeError, null, 2),
        });
        throw pincodeError;
      }
      console.log(
        `[setupUser] Pincode already set for ${user.email}, continuing...`
      );
    } else {
      console.log(`[setupUser] Successfully enabled pincode for ${user.email}`);
    }

    // Step 4: Generate secret codes
    console.log(
      `[setupUser] Step 4: Generating secret codes for user ${user.email}`
    );
    const secretCodeHeaders = await signInWithUser(user);
    const { error: secretCodeError } = await authClient.secretCodes.generate(
      {
        password: user.password,
      },
      {
        headers: secretCodeHeaders,
      }
    );

    if (secretCodeError) {
      console.log(`[setupUser] Secret code error for ${user.email}:`, {
        code: secretCodeError.code,
        message: secretCodeError.message,
        status: secretCodeError.status,
        statusText: secretCodeError.statusText,
        fullError: JSON.stringify(secretCodeError, null, 2),
      });
      throw secretCodeError;
    }
    console.log(
      `[setupUser] Successfully generated secret codes for ${user.email}`
    );

    // Step 5: Check onboarding status
    console.log(
      `[setupUser] Step 5: Checking onboarding status for user ${user.email}`
    );
    const sessionHeaders = await signInWithUser(user);
    const session = await authClient.getSession({
      fetchOptions: {
        headers: sessionHeaders,
      },
    });

    console.log(`[setupUser] Session data for ${user.email}:`, {
      hasData: !!session.data,
      hasUser: !!session.data?.user,
      isOnboarded: session.data?.user.isOnboarded,
      userId: session.data?.user.id,
      userEmail: session.data?.user.email,
    });

    if (!session.data?.user.isOnboarded) {
      console.log(
        `[setupUser] User ${user.email} is not onboarded - full session:`,
        JSON.stringify(session, null, 2)
      );
      throw new Error("User is not onboarded");
    }

    console.log(
      `[setupUser] Successfully completed setup for user ${user.email}`
    );
  } catch (err) {
    console.error(`[setupUser] Failed to create user ${user.email}:`, {
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
      fullError: JSON.stringify(err, null, 2),
    });
    throw err;
  }
}
