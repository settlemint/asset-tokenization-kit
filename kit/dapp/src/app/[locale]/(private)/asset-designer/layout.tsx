import { metadata as siteMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import type { PropsWithChildren } from "react";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      ...siteMetadata.title,
      default: "Asset Designer",
    },
    description: "Create your digital asset in a few steps.",
  };
}

export default function AssetDesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
