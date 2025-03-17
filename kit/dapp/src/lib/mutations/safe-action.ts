import { auth } from "@/lib/auth/auth";
import type { User } from "better-auth";
import {
  type ValidationErrors,
  createSafeActionClient,
} from "next-safe-action";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import type { Address } from "viem";
import type { Schema } from "zod";

type ValidationError = Error & {
  validationErrors: ValidationErrors<Schema>;
};

function isValidationError(error: Error): error is ValidationError {
  return "validationErrors" in error;
}

function consoleErrorValidationErrors(error: Error) {
  if (isValidationError(error)) {
    console.error(
      "Validation Errors ->",
      JSON.stringify(error.validationErrors, null, 2)
    );
  }
}

export const action = createSafeActionClient({
  throwValidationErrors: true,
  defaultValidationErrorsShape: "formatted",
  handleServerError: (error: Error, { clientInput, metadata }) => {
    console.error(`\n${"=".repeat(80)}`);
    console.error("🚨 Server Action Error");
    console.error("=".repeat(80));

    console.error("\n📥 Input Data:");
    console.error(redactSensitiveFields(clientInput));

    console.error("\n🔍 Metadata:");
    console.error(redactSensitiveFields(metadata));

    console.error("\n❌ Error Details:");
    console.error(error);

    console.error("\n🔍 Validation Info:");
    consoleErrorValidationErrors(error);

    console.error(`\n${"=".repeat(80)}\n`);

    return getErrorMessage(error);
  },
})
  .use(async ({ next, clientInput, metadata }) => {
    const result = await next({ ctx: undefined });

    if (process.env.NODE_ENV === "development") {
      console.log(`\n${"=".repeat(80)}`);
      console.log("🔍 Server Action");
      console.log("=".repeat(80));

      console.log("\n📥 Input Data:");
      console.log(redactSensitiveFields(clientInput));

      console.log("\n🔍 Metadata:");
      console.log(redactSensitiveFields(metadata));

      console.log("\n📤 Output:");
      console.log(redactSensitiveFields(result.data));

      console.log(`\n${"=".repeat(80)}\n`);
    }
    return result;
  })
  .use(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      unauthorized();
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

  if (error.message.includes("Invalid challenge response")) {
    return "Invalid pincode or OTP";
  }

  const revertReason = getRevertReason(error);
  if (revertReason?.includes("AccessControlUnauthorizedAccount")) {
    return "You are not authorized to perform this action";
  }
  return revertReason ?? "An unexpected error occurred";
}

const REVERT_REGEX =
  /^The\s+contract\s+function\s+".*?"\s+reverted\.\s+Error:\s+(.*?)\(/i;

function getRevertReason(error: Error): string | undefined {
  const match = error.message.replace(/\n/g, " ").match(REVERT_REGEX);
  if (match) {
    return match[1];
  }
  return undefined;
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
