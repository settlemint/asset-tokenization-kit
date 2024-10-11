import { WalletMainLayout } from "@/components/secure/wallet-main-layout";
import type { PropsWithChildren } from "react";

export default async function WalletLayout({ children }: PropsWithChildren) {
  return <WalletMainLayout>{children}</WalletMainLayout>;
}
