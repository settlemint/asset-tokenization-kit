import { metadata as siteMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import type { Locale } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const { locale } = params;

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
