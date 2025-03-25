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
    <main className="my-auto flex flex-col items-center">
      <AuthCard pathname={pathname} />
    </main>
  );
}
