import type { AssetType } from "../../types";
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
    case "bonds":
      return <BondsRelated />;
    case "cryptocurrencies":
      return <CryptocurrenciesRelated />;
    case "stablecoins":
      return <StablecoinsRelated />;
    case "tokenizeddeposits":
      return <TokenizedDepositsRelated />;
    case "equities":
      return <EquitiesRelated />;
    case "funds":
      return <FundsRelated />;
  }
}
