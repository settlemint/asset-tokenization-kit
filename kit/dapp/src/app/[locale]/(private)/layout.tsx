import { RoleGuard } from "@/components/blocks/auth/role-guard";
import { WalletSecurity } from "@/components/blocks/auth/wallet-security";
import NavInset from "@/components/layout/nav-inset";
import NavProvider from "@/components/layout/nav-provider";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { AdminSidebar } from "./_components/sidebar/sidebar";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{ locale: string }>;
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
    title: t("admin"),
    description: t("admin"),
  };
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <WalletSecurity>
          <RoleGuard requiredRoles={["admin", "issuer"]}>
            <NavProvider>
              <AdminSidebar />
              <NavInset>{children}</NavInset>
            </NavProvider>
          </RoleGuard>
        </WalletSecurity>
      </SignedIn>
    </>
  );
}
