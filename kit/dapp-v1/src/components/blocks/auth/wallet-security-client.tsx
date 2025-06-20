"use client";

import { authClient } from "@/lib/auth/client";
import { SignedIn } from "@daveyplate/better-auth-ui";
import type { ReactNode } from "react";
import { WalletSecuritySetupDialog } from "./wallet-security-setup-dialog";

interface WalletSecurityClientProps {
  children: ReactNode;
}

export function WalletSecurityClient({ children }: WalletSecurityClientProps) {
  const { data: sessionData } = authClient.useSession();

  const hasVerification = sessionData
    ? sessionData?.user?.pincodeEnabled || sessionData?.user?.twoFactorEnabled
    : true;

  return (
    <SignedIn>
      {hasVerification ? (
        <>{children}</>
      ) : (
        <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
          <WalletSecuritySetupDialog open={!hasVerification} />
        </div>
      )}
    </SignedIn>
  );
}
