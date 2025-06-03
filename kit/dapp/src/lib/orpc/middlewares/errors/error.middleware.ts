import { br } from "@/lib/orpc/routes/procedures/base.router";
import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError, ValidationError } from "@orpc/server";
import { APIError } from "better-auth/api";
import { ZodError, type ZodIssue } from "zod";

export function betterAuthErrorToORPCError(error: APIError) {
  return new ORPCError(error.status as ORPCErrorCode, {
    message: error.message,
    cause: error,
  });
}

export const errorMiddleware = br.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ORPCError) {
      console.error(" ERROR", "ORPC", error.status, error.message);
      throw error;
    }
    if (error instanceof APIError) {
      console.error(" ERROR", "Auth", error.statusCode, error.message);
      throw betterAuthErrorToORPCError(error);
    }
    if (
      error instanceof ORPCError &&
      error.code === "FORBIDDEN" &&
      error.cause instanceof ValidationError
    ) {
      throw new ORPCError("FORBIDDEN", {
        status: 403,
        cause: error.cause,
      });
    }

    if (
      error instanceof ORPCError &&
      error.code === "BAD_REQUEST" &&
      error.cause instanceof ValidationError
    ) {
      const zodError = new ZodError(error.cause.issues as ZodIssue[]);

      throw new ORPCError("INPUT_VALIDATION_FAILED", {
        status: 422,
        data: zodError.flatten(),
        cause: error.cause,
      });
    }

    if (
      error instanceof ORPCError &&
      error.code === "INTERNAL_SERVER_ERROR" &&
      error.cause instanceof ValidationError
    ) {
      const zodError = new ZodError(error.cause.issues as ZodIssue[]);

      throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
        status: 522,
        data: zodError.flatten(),
        cause: error.cause,
      });
    }
    throw error;
  }
});
