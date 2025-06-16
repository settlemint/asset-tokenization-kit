import { PortfolioValue } from "@/components/blocks/charts/portfolio/portfolio-value";
import type { User } from "@/lib/auth/types";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { getPortfolioStats } from "@/lib/queries/portfolio/portfolio-stats";
import type { Locale } from "next-intl";
import { Greeting } from "../greeting/greeting";

interface MyAssetsHeaderProps {
  locale: Locale;
  user: User;
}

export async function MyAssetsHeader({ locale, user }: MyAssetsHeaderProps) {
  const [myAssetsBalance, portfolioStats] = await Promise.all([
    getUserAssetsBalance(user.wallet),
    getPortfolioStats({
      address: user.wallet,
      days: 30,
    }),
  ]);

  const assetPrices = await getAssetsPricesInUserCurrency(
    portfolioStats.map(({ asset }) => asset.id),
    user.currency
  );

  const totalUserAssetsValue = myAssetsBalance.balances.reduce(
    (acc, balance) =>
      acc +
      (assetPrices.get(balance.asset.id)?.amount ?? 0) * Number(balance.value),
    0
  );

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <Greeting totalUserAssetsValue={totalUserAssetsValue} user={user} />
        <div className="col-span-3">
          <PortfolioValue
            portfolioStats={portfolioStats}
            assetPriceMap={assetPrices}
            locale={locale}
          />
        </div>
      </div>
    </>
  );
}
