import { TopInfo } from "@/components/blocks/top-info/top-info";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { AssetType } from "../types";
import { Related } from "./_components/related";
import { Table } from "./_components/table";

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
  }>;
}

export default async function AssetTypeTablePage({ params }: PageProps) {
  const { assettype, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "private.assets.table",
  });

  return (
    <>
      <PageHeader
        title={t(`page-title.${assettype}`)}
        section={t("asset-management")}
      />
      <TopInfo title={t(`topinfo-title.${assettype}`)}>
        <p>{t(`topinfo-description.${assettype}`)}</p>
      </TopInfo>
      <Table assettype={assettype} />
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
    title: t(`page-title.${assettype}`),
    description: t(`topinfo-title.${assettype}`),
  };
}
