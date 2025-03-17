'use client';

import { authClient } from '@/lib/auth/client';
import type { PropsWithChildren } from 'react';

type UserRole = 'admin' | 'issuer' | 'user';

interface RoleGuardProps extends PropsWithChildren {
  /**
   * The roles that are allowed to access the content
   */
  requiredRoles?: UserRole[];
}

/**
 * A component that checks if the user has the required roles to access the content
 * If the user doesn't have the required roles, they are redirected to the specified URL
 */
export function RoleGuard({ children, requiredRoles }: RoleGuardProps) {
  const { data: session } = authClient.useSession();
  const userRole = session?.user?.role;

  // If no required roles are specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // If user role is not provided, don't allow access
  if (!userRole) {
    return null;
  }

  // Check if the user has one of the required roles
  const hasRequiredRole = requiredRoles.includes(userRole as UserRole);

  return hasRequiredRole ? <>{children}</> : null;
}
