import type { Permissions } from "@/lib/auth/permissions";
import type { User } from "@/lib/auth/types";
import { authClient } from "../auth/client";
import { getUser } from "../auth/get-user";
import { handleAccessControlError } from "../auth/next-error-handling";
import type { Role } from "./zod/validators/roles";

/**
 * The error thrown when the user does not have the required permissions
 * @remarks
 * This is used to determine if the user is authenticated and has the required permissions
 * to access the resource.
 */
export class AccessControlError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AccessControlError";
    this.statusCode = statusCode;
  }
}

/**
 * The options for the access control
 */
type AccessControlOptions = {
  ctx?: {
    user: Omit<User, "wallet">;
  };
};

/**
 * Wraps a function with access control
 * @param requiredPermissions - The permissions required to access the resource
 * @param fn - The function to wrap
 * @returns The wrapped function
 */
export function withAccessControl<
  T extends (args: Parameters<T>[0]) => ReturnType<T>,
>(
  {
    requiredPermissions,
  }: {
    requiredPermissions: Partial<Permissions>;
  },
  fn: T
) {
  return async (
    options: AccessControlOptions &
      (Parameters<T>[0] extends undefined ? unknown : Parameters<T>[0]) = {}
  ): Promise<Awaited<ReturnType<T>>> => {
    if (typeof options !== "object") {
      throw new Error(
        `Function wrapped in withAccessControl expects an object as options, received: ${typeof options}`
      );
    }
    const { ctx, ...args } = options;
    const user = ctx?.user ?? (await getUser());
    const userRole = user.role ?? "";
    const hasPermission = authClient.admin.checkRolePermission({
      permission: requiredPermissions,
      role: userRole as Role,
    });
    if (!hasPermission) {
      const error = new AccessControlError("Forbidden", 403);
      const isNextJsPage = !ctx?.user;
      if (isNextJsPage) {
        handleAccessControlError(error);
      }
      throw error;
    }
    return fn({ ctx, ...args }) as Awaited<ReturnType<T>>;
  };
}
