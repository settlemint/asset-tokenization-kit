"use client";

import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
// eslint-disable-next-line no-restricted-imports
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";

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

  const providers: ("google" | "github")[] = [];
  if (googleEnabled) {
    providers.push("google");
  }
  if (githubEnabled) {
    providers.push("github");
  }

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        persistClient={false}
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => router.refresh()}
        Link={Link}
        settings={{
          url: "/portfolio/settings/profile",
        }}
        redirectTo="/portfolio"
        credentials={{
          confirmPassword: true,
          rememberMe: true,
          forgotPassword: emailEnabled,
        }}
        optimistic={true}
        deleteUser={{
          verification: emailEnabled,
        }}
        avatar={false}
        magicLink={emailEnabled}
        passkey={true}
        social={
          providers.length > 0
            ? {
                providers: providers,
              }
            : undefined
        }
        toast={({ variant, message }) => {
          if (variant === "success") {
            toast.success(message);
          } else if (variant === "error") {
            toast.error(message);
          } else if (variant === "warning") {
            toast.warning(message);
          } else {
            toast.info(message);
          }
        }}
      >
        <div className="AuthProvider">{children}</div>
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
};
