import { RoleGuard } from "@/components/blocks/auth/role-guard";
import NavInset from "@/components/layout/nav-inset";
import { metadata } from "@/lib/config/metadata";
import { getUserRole } from "@/lib/utils/zod/validators/user-roles";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { AssetsSidebar } from "../_components/sidebar/assets-sidebar";

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
      default: t("asset-management"),
    },
  };
}

export default function AssetsLayout({ children }: LayoutProps) {
  return (
    <>
      <RoleGuard
        allowedRoles={[getUserRole("admin"), getUserRole("issuer")]}
        redirectTo="/portfolio"
      />
      <AssetsSidebar />
      <NavInset>{children}</NavInset>
    </>
  );
}
