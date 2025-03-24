import { Details } from "@/app/[locale]/(private)/assets/[assettype]/[address]/(details)/_components/details";
import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { CollateralRatio } from "@/components/blocks/charts/assets/collateral-ratio";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { WalletDistribution } from "@/components/blocks/charts/assets/wallet-distribution";
import { getUser } from "@/lib/auth/utils";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
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
  const user = await getUser();

  // The URL parameter 'assettype' is used directly to determine which component to render
  // This ensures that when the URL has 'equity' in it, we show the equity component
  // and when it has 'fund' in it, we show the fund component
  return (
    <>
      <Details
        assettype={assettype}
        address={address}
        showBalance={true}
        userAddress={user.wallet as Address}
      />
      <ChartGrid title={t("asset-statistics-title")}>
        {assettype === "stablecoin" && (
          <CollateralRatio address={address} assettype={assettype} />
        )}
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <WalletDistribution address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </ChartGrid>
    </>
  );
}
