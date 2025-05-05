import { RoleGuard } from "@/components/blocks/auth/role-guard";
import NavInset from "@/components/layout/nav-inset";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { PlatformSidebar } from "../_components/sidebar/platform-sidebar";

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
    title: t("platform"),
  };
}

export default function PlatformLayout({ children }: LayoutProps) {
  return (
    <>
      <RoleGuard allowedRoles={["admin"]} redirectTo="/portfolio" />
      <PlatformSidebar />
      <NavInset>{children}</NavInset>
    </>
  );
}
