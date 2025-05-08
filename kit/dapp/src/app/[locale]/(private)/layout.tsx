import { ApplicationSetup } from "@/components/blocks/application-setup/application-setup";
import { WalletSecurity } from "@/components/blocks/auth/wallet-security";
import NavProvider from "@/components/layout/nav-provider";
import { metadata } from "@/lib/config/metadata";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 900; // 15 minutes

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

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <RedirectToSignIn />
      <WalletSecurity>
        <ApplicationSetup>
          <NavProvider>{children}</NavProvider>
        </ApplicationSetup>
      </WalletSecurity>
    </>
  );
}
