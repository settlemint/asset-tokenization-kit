import { auth } from "@/lib/auth/auth";
import { getUserWalletVerifications } from "@/lib/queries/user/wallet-security";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import type { Address } from "viem";
import { WalletSecurityClient } from "./wallet-security-client";

interface WalletSecurityProps {
  children: ReactNode;
}

export async function WalletSecurity({ children }: WalletSecurityProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const wallet = session?.user?.wallet;

  let hasVerification = false;
  if (wallet) {
    const verifications = await getUserWalletVerifications(wallet);
    hasVerification = (verifications && verifications.length > 0) || false;
  }

  return (
    <WalletSecurityClient
      hasVerification={hasVerification}
      walletAddress={wallet as Address}
    >
      {children}
    </WalletSecurityClient>
  );
}
