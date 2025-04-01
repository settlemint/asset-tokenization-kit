import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import type { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Address } from "viem";
import { BondsRelated } from "./related/bonds";
import { CryptocurrenciesRelated } from "./related/cryptocurrencies";
import { DepositsRelated } from "./related/deposits";
import { EquitiesRelated } from "./related/equities";
import { FundsRelated } from "./related/funds";
import { StablecoinsRelated } from "./related/stablecoins";

interface RelatedProps {
  assettype: AssetType;
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  /** Whether the current user is an admin */
  userIsAdmin: boolean;
}

export function Related({
  assettype,
  address,
  assetDetails,
  userBalance,
  userIsAdmin,
}: RelatedProps) {
  switch (assettype) {
    case "bond":
      return (
        <BondsRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
          userIsAdmin={userIsAdmin}
        />
      );
    case "cryptocurrency":
      return (
        <CryptocurrenciesRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
          userIsAdmin={userIsAdmin}
        />
      );
    case "stablecoin":
      return (
        <StablecoinsRelated
          address={address}
          assetDetails={
            assetDetails as Awaited<ReturnType<typeof getStableCoinDetail>>
          }
          userBalance={userBalance}
          userIsAdmin={userIsAdmin}
        />
      );
    case "deposit":
      return (
        <DepositsRelated
          address={address}
          assetDetails={
            assetDetails as Awaited<ReturnType<typeof getDepositDetail>>
          }
          userBalance={userBalance}
          userIsAdmin={userIsAdmin}
        />
      );
    case "equity":
      return (
        <EquitiesRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
          userIsAdmin={userIsAdmin}
        />
      );
    case "fund":
      return (
        <FundsRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
          userIsAdmin={userIsAdmin}
        />
      );
    default:
      throw new Error("Invalid asset type");
  }
}
