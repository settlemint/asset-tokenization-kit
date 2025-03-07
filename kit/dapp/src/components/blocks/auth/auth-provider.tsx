"use client";

import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import {
  AuthUIProvider,
  type SocialProvider,
} from "@daveyplate/better-auth-ui";
import type { PropsWithChildren } from "react";

interface AuthProviderProps extends PropsWithChildren {
  emailEnabled: boolean;
  googleEnabled: boolean;
  githubEnabled: boolean;
  /**
   * The roles that are allowed to access the content
   */
  requiredRoles?: ("admin" | "issuer" | "user")[];
}

export const AuthProvider = ({
  children,
  emailEnabled,
  googleEnabled,
  githubEnabled,
}: AuthProviderProps) => {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      LinkComponent={Link}
      settingsUrl="/portfolio/settings/security"
      defaultRedirectTo="/portfolio"
      optimistic={true}
      rememberMe={true}
      forgotPassword={emailEnabled}
      avatar={true}
      magicLink={emailEnabled}
      passkey={true}
      providers={
        googleEnabled || githubEnabled
          ? ([
              ...(googleEnabled ? ["google"] : []),
              ...(githubEnabled ? ["github"] : []),
            ] as SocialProvider[])
          : undefined
      }
    >
      {children}
    </AuthUIProvider>
  );
};
