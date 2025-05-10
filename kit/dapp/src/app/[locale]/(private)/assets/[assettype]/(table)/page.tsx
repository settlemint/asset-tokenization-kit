import { AssetDesignerButton } from "@/components/blocks/asset-designer/asset-designer-button";
import { TopInfo } from "@/components/blocks/top-info/top-info";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth/utils";
import { metadata } from "@/lib/config/metadata";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Related } from "./_components/related";
import { AssetsTable } from "./_components/table";

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
  }>;
}

export default async function AssetTypeTablePage({ params }: PageProps) {
  const { assettype, locale } = await params;
  const user = await getUser();
  const t = await getTranslations({
    locale,
    namespace: "private.assets.table",
  });

  return (
    <>
      <PageHeader
        title={t(`page-title.${assettype}`)}
        section={t("asset-management")}
        button={<AssetDesignerButton currentUser={user} />}
      />
      <TopInfo title={t(`topinfo-title.${assettype}`)}>
        <p>{t(`topinfo-description.${assettype}`)}</p>
      </TopInfo>
      <Suspense fallback={<Skeleton className="h-80 w-full bg-muted/50" />}>
        <AssetsTable assettype={assettype} />
      </Suspense>
      <Related assettype={assettype} />
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { assettype, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "private.assets.table",
  });

  return {
    title: {
      ...metadata.title,
      default: t(`page-title.${assettype}`),
    },
    description: t(`topinfo-title.${assettype}`),
  };
}
