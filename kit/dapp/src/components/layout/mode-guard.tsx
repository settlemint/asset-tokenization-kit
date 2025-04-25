"use client";

import { usePathname } from "@/i18n/routing";
import type { PropsWithChildren } from "react";

type Mode = "assets" | "platform" | "portfolio";

interface ModeGuardProps extends PropsWithChildren {
  /**
   * The roles that are allowed to access the content
   */
  requiredMode?: Mode;
}

/**
 * A component that checks if the user has the required roles to access the content
 * If the user doesn't have the required roles, they are redirected to the specified URL
 */
export function ModeGuard({ children, requiredMode }: ModeGuardProps) {
  const pathname = usePathname();
  const mode = pathname.includes("/assets")
    ? "assets"
    : pathname.includes("/platform")
      ? "platform"
      : "portfolio";

  // If no required roles are specified, allow access
  if (!requiredMode) {
    return <>{children}</>;
  }

  // If user role is not provided, don't allow access
  if (mode !== requiredMode) {
    return null;
  }

  return <>{children}</>;
}
