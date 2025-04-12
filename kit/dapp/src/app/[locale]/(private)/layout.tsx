import { WalletSecurity } from "@/components/blocks/auth/wallet-security";
import NavInset from "@/components/layout/nav-inset";
import NavProvider from "@/components/layout/nav-provider";
import { metadata } from "@/lib/config/metadata";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { PrivateSidebar } from "./_components/sidebar/sidebar";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "layout.navigation",
  });

  return {
    title: {
      ...metadata.title,
      default: t("title"),
    },
  };
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <>
      <RedirectToSignIn />
      <WalletSecurity>
        <NavProvider>
          <PrivateSidebar />
          <NavInset>{children}</NavInset>
        </NavProvider>
      </WalletSecurity>
    </>
  );
}
