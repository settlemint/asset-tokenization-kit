import { ChartGrid } from "@/components/blocks/chart-grid/chart-grid";
import { BondStatusProgress } from "@/components/blocks/charts/assets/bond/bond-status-progress";
import { BondUnitsOverTime } from "@/components/blocks/charts/assets/bond/bond-units-over-time";
import { BondYieldCoverage } from "@/components/blocks/charts/assets/bond/bond-yield-coverage";
import { BondYieldDistribution } from "@/components/blocks/charts/assets/bond/bond-yield-distribution";
import { CollateralRatio } from "@/components/blocks/charts/assets/collateral-ratio";
import { TotalSupply } from "@/components/blocks/charts/assets/total-supply";
import { TotalSupplyChanged } from "@/components/blocks/charts/assets/total-supply-changed";
import { TotalTransfers } from "@/components/blocks/charts/assets/total-transfers";
import { TotalVolume } from "@/components/blocks/charts/assets/total-volume";
import { WalletDistribution } from "@/components/blocks/charts/assets/wallet-distribution";
import { getUser } from "@/lib/auth/utils";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { Details } from "./_components/details";
import { Related } from "./_components/related";

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
    address: Address;
  }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const { assettype, address } = await params;
  const user = await getUser();

  const [assetDetails, t, userBalance] = await Promise.all([
    getAssetDetail({ address, assettype }),
    getTranslations("private.assets"),
    getAssetBalanceDetail({
      address,
      account: user.wallet as Address,
    }),
  ]);

  return (
    <>
      <Details assettype={assettype} address={address} />
      <ChartGrid title={t("asset-statistics-title")}>
        {["stablecoin", "deposit"].includes(assettype) && (
          <CollateralRatio address={address} assettype={assettype} />
        )}
        {assettype === "bond" && (
          <>
            <BondStatusProgress address={address} />
            <BondUnitsOverTime address={address} />
            <BondYieldCoverage address={address} />
            <BondYieldDistribution address={address} />
          </>
        )}
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <WalletDistribution address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </ChartGrid>
      <Related
        assettype={assettype}
        address={address}
        assetDetails={assetDetails}
        userBalance={userBalance}
      />
    </>
  );
}
