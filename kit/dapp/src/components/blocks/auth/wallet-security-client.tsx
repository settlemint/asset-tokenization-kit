"use client";

import { PincodeDialog } from "@/components/blocks/auth/pincode-dialog";
import { useState, type ReactNode } from "react";
import { SetupTwoFactorDialog } from "./setup-two-factor-dialog";
import {
  WalletSecurityMethodDialog,
  WalletSecurityMethodOptions,
  type WalletSecurityMethod,
} from "./wallet-security-method-dialog";

interface WalletSecurityClientProps {
  children: ReactNode;
  hasVerification: boolean;
}

export function WalletSecurityClient({
  children,
  hasVerification,
}: WalletSecurityClientProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<WalletSecurityMethod | null>(null);

  return (
    <>
      {hasVerification ? (
        children
      ) : (
        <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
          <WalletSecurityMethodDialog
            open={!hasVerification && selectedMethod === null}
            onOpenChange={() => setSelectedMethod(null)}
            onSelect={setSelectedMethod}
          />
          <PincodeDialog
            open={selectedMethod === WalletSecurityMethodOptions.Pincode}
            onOpenChange={() => setSelectedMethod(null)}
          />
          <SetupTwoFactorDialog
            open={
              selectedMethod ===
              WalletSecurityMethodOptions.TwoFactorAuthentication
            }
            onOpenChange={() => setSelectedMethod(null)}
            refreshOnSuccess={true}
          />
        </div>
      )}
    </>
  );
}
