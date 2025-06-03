import { br } from "@/lib/orpc/routes/procedures/base.router";
import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError } from "@orpc/server";
import { APIError } from "better-auth/api";

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
    throw error;
  }
});
