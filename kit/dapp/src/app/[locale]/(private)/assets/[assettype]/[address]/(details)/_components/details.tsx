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
  showBalance?: boolean;
  userAddress?: Address;
}

export function Details({ assettype, address, showBalance = false, userAddress }: DetailsProps) {
  switch (assettype) {
    case "bond":
      return <BondsDetails address={address} showBalance={showBalance} userAddress={userAddress} />;
    case "cryptocurrency":
      return <CryptocurrenciesDetails address={address} showBalance={showBalance} userAddress={userAddress} />;
    case "stablecoin":
      return (
        <>
          <StablecoinsDetails address={address} showBalance={showBalance} userAddress={userAddress} />
          <Collateral address={address} assettype={assettype} />
        </>
      );
    case "tokenizeddeposit":
      return (
        <>
          <TokenizedDepositsDetails address={address} showBalance={showBalance} userAddress={userAddress} />
          <Collateral address={address} assettype={assettype} />
        </>
      );
    case "equity":
      return <EquitiesDetails address={address} showBalance={showBalance} userAddress={userAddress} />;
    case "fund":
      return <FundsDetails address={address} showBalance={showBalance} userAddress={userAddress} />;
    default:
      throw new Error("Invalid asset type");
  }
}
