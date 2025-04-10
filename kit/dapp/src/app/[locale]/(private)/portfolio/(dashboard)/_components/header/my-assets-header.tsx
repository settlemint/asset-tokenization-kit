import { PortfolioValue } from "@/components/blocks/charts/portfolio/portfolio-value";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { getPortfolioStats } from "@/lib/queries/portfolio/portfolio-stats";
import { getCurrentUserDetail } from "@/lib/queries/user/user-detail";
import type { Locale } from "next-intl";
import type { Address } from "viem";
import { TransferForm } from "../../../_components/transfer-form/form";
import { MyAssetsCount } from "./my-assets-count";

interface MyAssetsHeaderProps {
  locale: Locale;
  walletAddress: Address;
}

export async function MyAssetsHeader({
  locale,
  walletAddress,
}: MyAssetsHeaderProps) {
  const [myAssetsBalance, userDetails, portfolioStats] = await Promise.all([
    getUserAssetsBalance(walletAddress),
    getCurrentUserDetail(),
    getPortfolioStats({
      address: walletAddress,
      days: 30,
    }),
  ]);

  const assetPrices = await getAssetsPricesInUserCurrency(
    portfolioStats.map(({ asset }) => asset.id)
  );

  const totalUserAssetsValue = myAssetsBalance.balances.reduce(
    (acc, balance) =>
      acc +
      (assetPrices.get(balance.asset.id)?.amount ?? 0) * Number(balance.value),
    0
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <MyAssetsCount
          totalCount={myAssetsBalance.total}
          totalValue={{
            amount: totalUserAssetsValue,
            currency: userDetails.currency,
          }}
        />
        <TransferForm userAddress={userDetails.wallet} asButton />
      </div>
      <PortfolioValue
        portfolioStats={portfolioStats}
        assetPriceMap={assetPrices}
        locale={locale}
      />
    </>
  );
}
