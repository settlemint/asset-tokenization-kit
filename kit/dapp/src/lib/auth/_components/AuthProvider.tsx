"use client";

import { Link, useRouter } from "@/i18n/routing";
import {
  AuthUIProvider,
  type SocialProvider,
} from "@daveyplate/better-auth-ui";
import type { PropsWithChildren } from "react";
import { authClient } from "../client";

interface AuthProviderProps extends PropsWithChildren {
  emailEnabled: boolean;
  googleEnabled: boolean;
  githubEnabled: boolean;
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
