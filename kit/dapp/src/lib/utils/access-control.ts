import type { User } from "@/lib/auth/types";
import { forbidden } from "next/navigation";
import { authClient } from "../auth/client";
import { getUser } from "../auth/utils";

/**
 * The error thrown when the user does not have the required permissions
 * @remarks
 * This is used to determine if the user is authenticated and has the required permissions
 * to access the resource.
 */
export class AccessControlError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AccessControlError";
    this.status = status;
  }
}

/**
 * The context of the user, should be omitted if the function is called from a Next.js page
 * @remarks
 * This is used to determine if the user is authenticated and has the required permissions
 * to access the resource.
 */
type UserContext = {
  currentUser?: Omit<User, "wallet">;
};

export function withAccessControl<
  T extends (args: Parameters<T>[0]) => ReturnType<T>,
>(
  {
    requiredPermissions,
  }: {
    requiredPermissions: {
      user?: (
        | "create"
        | "list"
        | "set-role"
        | "ban"
        | "impersonate"
        | "delete"
        | "set-password"
      )[];
      session?: ("list" | "revoke" | "delete")[];
    };
  },
  fn: T
) {
  return async ({
    currentUser,
    ...args
  }: UserContext &
    (Parameters<T>[0] extends undefined ? unknown : Parameters<T>[0]) = {}) => {
    const user = currentUser ?? (await getUser());
    const userRole = user.role ?? "";
    const hasPermission = authClient.admin.checkRolePermission({
      permission: requiredPermissions,
      role: userRole,
    });
    if (!hasPermission) {
      const isNextJs = !currentUser;
      if (isNextJs) {
        forbidden();
      }
      throw new AccessControlError("Forbidden", 403);
    }
    return fn(args) as Awaited<ReturnType<T>>;
  };
}
