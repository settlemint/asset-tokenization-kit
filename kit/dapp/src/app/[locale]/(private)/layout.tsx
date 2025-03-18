import { WalletSecurity } from "@/components/blocks/auth/wallet-security";
import NavInset from "@/components/layout/nav-inset";
import NavProvider from "@/components/layout/nav-provider";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import type { Locale } from "next-intl";
import type { PropsWithChildren } from "react";
import { PrivateSidebar } from "./_components/sidebar/sidebar";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <WalletSecurity>
          <NavProvider>
            <PrivateSidebar />
            <NavInset>{children}</NavInset>
          </NavProvider>
        </WalletSecurity>
      </SignedIn>
    </>
  );
}
