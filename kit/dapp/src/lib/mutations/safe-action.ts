import { auth } from "@/lib/auth/auth";
import type { User } from "better-auth";
import { createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";
import type { Address } from "viem";

export const action = createSafeActionClient({
  throwValidationErrors: true,
  defaultValidationErrorsShape: "flattened",
  handleServerError: (error: Error, { clientInput, metadata }) => {
    console.error("Input ->", redactSensitiveFields(clientInput));
    console.error("Metadata ->", redactSensitiveFields(metadata));
    console.error("Error ->", error);

    return getErrorMessage(error);
  },
})
  .use(async ({ next, clientInput, metadata }) => {
    const result = await next({ ctx: undefined });
    console.log("Input ->", redactSensitiveFields(clientInput));
    console.log("Metadata ->", redactSensitiveFields(metadata));
    console.log("Result ->", redactSensitiveFields(result.data));
    return result;
  })
  .use(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return next({
      ctx: {
        user: session.user as Omit<User, "wallet"> & { wallet: Address },
      },
    });
  });

/**
 * Maps error messages to user-friendly messages based on error content
 */
function getErrorMessage(error: Error): string {
  if (!(error instanceof Error)) {
    return "An unexpected error occurred";
  }

  const msg = error.message;
  switch (true) {
    case msg.includes("AccessControlUnauthorizedAccount"):
      return "You are not authorized to perform this action";
    default:
      return "An unexpected error occurred";
  }
}

/**
 * Redacts sensitive fields in an object by replacing their values with asterisks
 */
function redactSensitiveFields(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveFields);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (key === "pincode") {
        return [key, "******"];
      }
      if (typeof value === "object" && value !== null) {
        return [key, redactSensitiveFields(value)];
      }
      return [key, value];
    })
  );
}
