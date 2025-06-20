import type { ReactNode } from "react";
import { WalletSecurityClient } from "./wallet-security-client";

interface WalletSecurityProps {
  children: ReactNode;
}

export async function WalletSecurity({ children }: WalletSecurityProps) {
  return <WalletSecurityClient>{children}</WalletSecurityClient>;
}
