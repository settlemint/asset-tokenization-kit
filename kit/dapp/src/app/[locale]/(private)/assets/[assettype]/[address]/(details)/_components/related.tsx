import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { AssetType } from "@/lib/utils/zod";
import type { Address } from "viem";
import { BondsRelated } from "./related/bonds";
import { CryptocurrenciesRelated } from "./related/cryptocurrencies";
import { EquitiesRelated } from "./related/equities";
import { FundsRelated } from "./related/funds";
import { StablecoinsRelated } from "./related/stablecoins";
import { TokenizedDepositsRelated } from "./related/tokenizeddeposits";

interface RelatedProps {
  assettype: AssetType;
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export function Related({
  assettype,
  address,
  assetDetails,
  userBalance,
}: RelatedProps) {
  switch (assettype) {
    case "bond":
      return (
        <BondsRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
        />
      );
    case "cryptocurrency":
      return (
        <CryptocurrenciesRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
        />
      );
    case "stablecoin":
      return (
        <StablecoinsRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
        />
      );
    case "tokenizeddeposit":
      return (
        <TokenizedDepositsRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
        />
      );
    case "equity":
      return (
        <EquitiesRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
        />
      );
    case "fund":
      return (
        <FundsRelated
          address={address}
          assetDetails={assetDetails}
          userBalance={userBalance}
        />
      );
    default:
      throw new Error("Invalid asset type");
  }
}
