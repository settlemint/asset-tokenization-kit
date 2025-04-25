import NavInset from "@/components/layout/nav-inset";
import { metadata as siteMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { AssetDesignerSidebar } from "../_components/sidebar/asset-designer-sidebar";

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
      ...siteMetadata.title,
      default: "Asset Designer",
    },
    description: "Create your digital asset in a few steps.",
  };
}

export default function AssetDesignerLayout({ children }: LayoutProps) {
  return (
    <>
      <AssetDesignerSidebar />
      <NavInset>{children}</NavInset>
    </>
  );
}
