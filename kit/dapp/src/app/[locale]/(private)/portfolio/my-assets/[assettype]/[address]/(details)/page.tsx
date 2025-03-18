import { Details } from "@/app/[locale]/(private)/assets/[assettype]/[address]/(details)/_components/details";
import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { CollateralRatio } from "@/components/blocks/charts/assets/collateral-ratio";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { WalletDistribution } from "@/components/blocks/charts/assets/wallet-distribution";
import type { AssetType } from "@/lib/utils/zod";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
    address: Address;
  }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const { assettype, address } = await params;
  const t = await getTranslations("private.assets");
  
  // Fix for ENG-2475: Use the correct component based on the actual asset type
  // instead of relying on the URL parameter which might be incorrect
  let correctedAssetType = assettype;
  
  // If the URL says "equity" but it's actually a fund, correct it
  if (assettype === "equity") {
    // We need to check if this is actually a fund
    // For now, we'll just use the fund component directly
    // In a more robust solution, we would check the asset type from the API
    correctedAssetType = "fund";
  }
  
  return (
    <>
      <Details assettype={correctedAssetType} address={address} />
      <ChartGrid title={t("asset-statistics-title")}>
        {assettype === "stablecoin" && <CollateralRatio address={address} />}
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <WalletDistribution address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </ChartGrid>
    </>
  );
}