import { hasWalletVerification } from "@/lib/queries/user/wallet-security";
import type { ReactNode } from "react";
import { WalletSecurityClient } from "./wallet-security-client";

interface WalletSecurityProps {
  children: ReactNode;
}

export async function WalletSecurity({ children }: WalletSecurityProps) {
  const hasVerification = await hasWalletVerification();

  return (
    <WalletSecurityClient hasVerification={hasVerification}>
      {children}
    </WalletSecurityClient>
  );
}
