"use client";

import { hasWalletVerification } from "@/lib/queries/user/wallet-security";
import { useEffect, useState, type ReactNode } from "react";
import { WalletSecuritySetupDialog } from "./wallet-security-setup-dialog";

interface WalletSecurityClientProps {
  children: ReactNode;
}

export function WalletSecurityClient({ children }: WalletSecurityClientProps) {
  const [hasVerification, setHasVerification] = useState(true);

  useEffect(() => {
    hasWalletVerification()
      .then((hasVerification) => {
        setHasVerification(hasVerification);
      })
      .catch((error) => {
        console.error(error);
        setHasVerification(false);
      });
  }, []);

  return (
    <>
      {hasVerification ? (
        children
      ) : (
        <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
          <WalletSecuritySetupDialog
            open={!hasVerification}
            onSetupComplete={() => {
              setHasVerification(true);
            }}
          />
        </div>
      )}
    </>
  );
}
