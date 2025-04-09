"use client";

import type { ReactNode } from "react";
import { WalletSecuritySetupDialog } from "./wallet-security-setup-dialog";

interface WalletSecurityClientProps {
  children: ReactNode;
  hasVerification: boolean;
}

export function WalletSecurityClient({
  children,
  hasVerification,
}: WalletSecurityClientProps) {
  return (
    <>
      {hasVerification ? (
        children
      ) : (
        <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
          <WalletSecuritySetupDialog open={!hasVerification} />
        </div>
      )}
    </>
  );
}
