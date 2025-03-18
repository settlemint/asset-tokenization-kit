import type { AssetType } from "@/lib/utils/zod";
import { BondsRelated } from "./related/bonds";
import { CryptocurrenciesRelated } from "./related/cryptocurrencies";
import { EquitiesRelated } from "./related/equities";
import { FundsRelated } from "./related/funds";
import { StablecoinsRelated } from "./related/stablecoins";
import { TokenizedDepositsRelated } from "./related/tokenizeddeposits";

interface RelatedProps {
  assettype: AssetType;
}

export function Related({ assettype }: RelatedProps) {
  switch (assettype) {
    case "bond":
      return <BondsRelated />;
    case "cryptocurrency":
      return <CryptocurrenciesRelated />;
    case "stablecoin":
      return <StablecoinsRelated />;
    case "tokenizeddeposit":
      return <TokenizedDepositsRelated />;
    case "equity":
      return <EquitiesRelated />;
    case "fund":
      return <FundsRelated />;
    default:
      throw new Error("Invalid asset type");
  }
}
