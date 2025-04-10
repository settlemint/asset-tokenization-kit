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
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { calculateMaxRange } from "@/lib/utils/timeRange";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";
import { Related } from "./related";

interface ChartsProps {
  assettype: AssetType;
  address: Address;
}

export async function Charts({ assettype, address }: ChartsProps) {
  const user = await getUser();

  // Fetch asset details, translations, and asset users details
  const [assetDetails, t, assetUsersDetails] = await Promise.all([
    getAssetDetail({ address, assettype }),
    getTranslations("private.assets"),
    getAssetUsersDetail({ address }),
  ]);

  // Conditionally fetch user balance
  let userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>> =
    undefined;

  // Check if wallet exists and is a valid address
  if (
    user.wallet &&
    typeof user.wallet === "string" &&
    user.wallet.startsWith("0x")
  ) {
    try {
      userBalance = await getAssetBalanceDetail({
        address,
        account: user.wallet as Address,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  // Fetch remaining data
  const [assetStats, locale] = await Promise.all([
    getAssetStats({ address }),
    getLocale(),
  ]);

  const calculatedMaxRange = calculateMaxRange(assetDetails.deployedOn);

  return (
    <>
      <ChartGrid title={t("asset-statistics-title")}>
        {["stablecoin", "tokenizeddeposit"].includes(assettype) && (
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
        <TotalSupply
          data={assetStats}
          locale={locale}
          maxRange={calculatedMaxRange}
        />
        <TotalSupplyChanged
          data={assetStats}
          locale={locale}
          maxRange={calculatedMaxRange}
        />
        <WalletDistribution address={address} />
        <TotalTransfers
          data={assetStats}
          locale={locale}
          maxRange={calculatedMaxRange}
        />
        <TotalVolume
          data={assetStats}
          locale={locale}
          maxRange={calculatedMaxRange}
        />
      </ChartGrid>
      <Related
        assettype={assettype}
        address={address}
        assetDetails={assetDetails}
        userBalance={userBalance}
        assetUsersDetails={assetUsersDetails}
        currentUserWallet={user.wallet as Address | undefined}
      />
    </>
  );
}
