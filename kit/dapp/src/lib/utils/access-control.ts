import type { Permissions } from "@/lib/auth/permissions";
import type { User } from "@/lib/auth/types";
import { authClient } from "../auth/client";
import { getUser } from "../auth/utils";

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
  onError?: (error: AccessControlError) => never;
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
  return async ({
    ctx,
    onError,
    ...args
  }: AccessControlOptions &
    (Parameters<T>[0] extends undefined
      ? unknown
      : Parameters<T>[0]) = {}): Promise<Awaited<ReturnType<T>>> => {
    const user = ctx?.user ?? (await getUser());
    const userRole = user.role ?? "";
    const hasPermission = authClient.admin.checkRolePermission({
      permission: requiredPermissions,
      role: userRole,
    });
    if (!hasPermission) {
      const error = new AccessControlError("Forbidden", 403);
      if (typeof onError === "function") {
        onError(error);
      }
      throw error;
    }
    return fn({ ctx, ...args }) as Awaited<ReturnType<T>>;
  };
}
