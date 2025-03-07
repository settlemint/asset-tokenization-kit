import { WalletSecurity } from "@/components/blocks/auth/wallet-security";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return <WalletSecurity>{children}</WalletSecurity>;
}
