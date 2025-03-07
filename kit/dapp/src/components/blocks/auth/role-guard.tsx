"use client";

import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";

type UserRole = "admin" | "issuer" | "user";

interface RoleGuardProps extends PropsWithChildren {
  /**
   * The roles that are allowed to access the content
   */
  requiredRoles?: UserRole[];
  /**
   * The user's role
   */
  userRole?: string;
  /**
   * The URL to redirect to if the user doesn't have the required role
   * @default "/auth/wrong-role"
   */
  redirectTo?: string;
}

/**
 * A component that checks if the user has the required roles to access the content
 * If the user doesn't have the required roles, they are redirected to the specified URL
 */
export function RoleGuard({
  children,
  requiredRoles,
  redirectTo = "/auth/wrong-role",
}: RoleGuardProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role;
  useEffect(() => {
    // If no required roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return;
    }

    // If user role is not provided, don't allow access
    if (!userRole) {
      router.push(redirectTo);
      return;
    }

    // Check if the user has one of the required roles
    const hasRequiredRole = requiredRoles.includes(userRole as UserRole);
    if (!hasRequiredRole) {
      router.push(redirectTo);
    }
  }, [requiredRoles, userRole, redirectTo, router]);

  // If no required roles are specified or the user has the required role, render the children
  if (!requiredRoles || requiredRoles.length === 0 || !userRole) {
    return <>{children}</>;
  }

  const hasRequiredRole = requiredRoles.includes(userRole as UserRole);
  return hasRequiredRole ? <>{children}</> : null;
}
