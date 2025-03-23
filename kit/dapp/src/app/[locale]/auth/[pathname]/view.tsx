"use client";

import { useRouter } from "@/i18n/routing";
import { AuthCard } from "@daveyplate/better-auth-ui";
import { useEffect } from "react";

export function AuthView({ pathname }: { pathname: string }) {
  const router = useRouter();

  useEffect(() => {
    // Clear router cache (protected routes)
    router.refresh();
  }, [router]);

  return (
    <main className="flex flex-col grow p-4 items-center justify-center">
      <AuthCard pathname={pathname} />
    </main>
  );
}
