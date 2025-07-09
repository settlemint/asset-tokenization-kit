import { authClient } from "./auth-client";

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
    if (!session.data?.user.isOnboarded) {
      throw new Error("User is not onboarded");
    }
  } catch (err) {
    console.error(`Failed to create user ${user.email} `, err);
    throw err;
  }
}
