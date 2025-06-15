import { authClient } from "@/lib/auth/auth.client";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { Link, useRouter } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";

export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        authClient={authClient}
        navigate={(href) => router.navigate({ href })}
        replace={(href) => router.navigate({ href, replace: true })}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
        optimistic={true}
        persistClient={false}
        passkey={true}
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
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
}
