import { DetailPageHeader } from "@/app/[locale]/(private)/_components/detail-page-header";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
import type { Address } from "viem";
import { ManageDropdown } from "./_components/manage-dropdown";

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: Locale;
    address: Address;
    assettype: AssetType;
  }>;
}

export default async function AssetDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, assettype } = await params;

  return (
    <>
      <DetailPageHeader
        address={address}
        assettype={assettype}
        manageDropdown={({ assetDetails, userBalance, userAddress }) => (
          <ManageDropdown
            address={address}
            assettype={assettype}
            assetDetails={assetDetails}
            userBalance={userBalance}
            userAddress={userAddress}
          />
        )}
      />
      {children}
    </>
  );
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { address, assettype, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "private.assets.details",
  });
  const detailData = await getAssetDetail({ assettype, address });

  return {
    title: t("page-title", {
      name: detailData?.name,
    }),
    description: t("page-description", {
      name: detailData?.name,
    }),
  };
}
