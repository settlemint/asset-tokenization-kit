import type { AssetType } from "@/lib/utils/zod";
import type { Address } from "viem";
import { BondsDetails } from "./details/bonds";
import { Collateral } from "./details/collateral";
import { CryptocurrenciesDetails } from "./details/cryptocurrencies";
import { EquitiesDetails } from "./details/equities";
import { FundsDetails } from "./details/funds";
import { StablecoinsDetails } from "./details/stablecoins";
import { TokenizedDepositsDetails } from "./details/tokenizeddeposits";

interface DetailsProps {
  assettype: AssetType;
  address: Address;
}

export function Details({ assettype, address }: DetailsProps) {
  switch (assettype) {
    case "bond":
      return <BondsDetails address={address} />;
    case "cryptocurrency":
      return <CryptocurrenciesDetails address={address} />;
    case "stablecoin":
      return (
        <>
          <StablecoinsDetails address={address} />
          <Collateral address={address} assettype={assettype} />
        </>
      );
    case "tokenizeddeposit":
      return (
        <>
          <TokenizedDepositsDetails address={address} />
          <Collateral address={address} assettype={assettype} />
        </>
      );
    case "equity":
      return <EquitiesDetails address={address} />;
    case "fund":
      return <FundsDetails address={address} />;
    default:
      throw new Error("Invalid asset type");
  }
}
