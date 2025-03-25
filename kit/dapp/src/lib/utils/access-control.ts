import type { User } from "@/lib/auth/types";
import { authClient } from "../auth/client";
import { getUser } from "../auth/utils";

export class AccessControlError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AccessControlError";
    this.status = status;
  }
}

type UserContext = {
  currentUser?: Omit<User, "wallet">;
  [key: string]: unknown;
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
      throw new AccessControlError("Forbidden", 403);
    }
    return fn(args) as Awaited<ReturnType<T>>;
  };
}
