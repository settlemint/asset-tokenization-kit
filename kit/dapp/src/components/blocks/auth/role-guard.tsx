"use client";

import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import type { UserRole } from "@/lib/utils/zod/validators/user-roles";
import { useEffect, type PropsWithChildren } from "react";

interface RoleGuardProps extends PropsWithChildren {
  /**
   * The roles that are allowed to access the content
   */
  allowedRoles: UserRole[];
  /**
   * The URL to redirect to if the user doesn't have the required roles
   */
  redirectTo?: string;
}

/**
 * A component that checks if the user has the required roles to access the content
 * If the user doesn't have the required roles, they are redirected to the specified URL
 */
export function RoleGuard({
  children,
  allowedRoles,
  redirectTo,
}: RoleGuardProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const userRole = session?.user?.role;

  const hasAccess =
    allowedRoles.length === 0 || allowedRoles.includes(userRole);

  useEffect(() => {
    if (!session || !redirectTo) {
      return;
    }

    if (!hasAccess) {
      router.push(redirectTo);
    }
  }, [session, hasAccess, redirectTo, router]);

  return hasAccess ? <>{children}</> : null;
}
