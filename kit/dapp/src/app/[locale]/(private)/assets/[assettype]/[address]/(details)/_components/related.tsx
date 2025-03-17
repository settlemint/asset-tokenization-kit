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
  totalSupply: number;
}

export function Related({ assettype, address, totalSupply }: RelatedProps) {
  switch (assettype) {
    case "bond":
      return <BondsRelated address={address} totalSupply={totalSupply} />;
    case "cryptocurrency":
      return <CryptocurrenciesRelated address={address} />;
    case "stablecoin":
      return <StablecoinsRelated address={address} totalSupply={totalSupply} />;
    case "tokenizeddeposit":
      return (
        <TokenizedDepositsRelated address={address} totalSupply={totalSupply} />
      );
    case "equity":
      return <EquitiesRelated address={address} totalSupply={totalSupply} />;
    case "fund":
      return <FundsRelated address={address} totalSupply={totalSupply} />;
    default:
      throw new Error("Invalid asset type");
  }
}
