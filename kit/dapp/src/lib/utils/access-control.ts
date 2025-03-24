import type { User } from "@/lib/auth/types";
import { authClient } from "../auth/client";

export class AccessControlError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AccessControlError";
    this.status = status;
  }
}

export function withAccessControl<T>(
  {
    currentUser,
    requiredPermissions,
  }: {
    currentUser: Omit<User, "wallet">;
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
  fn: () => Promise<T>
) {
  const userRole = currentUser.role ?? "";
  const hasPermission = authClient.admin.checkRolePermission({
    permission: requiredPermissions,
    role: userRole,
  });
  if (hasPermission) {
    throw new AccessControlError("Forbidden", 403);
  }
  return fn();
}
