import { CreateBondForm } from "@/components/blocks/create-forms/bonds/form";
import { CreateCryptoCurrencyForm } from "@/components/blocks/create-forms/cryptocurrencies/form";
import { CreateEquityForm } from "@/components/blocks/create-forms/equities/form";
import { CreateFundForm } from "@/components/blocks/create-forms/funds/form";
import { CreateStablecoinForm } from "@/components/blocks/create-forms/stablecoins/form";
import { CreateTokenizedDepositForm } from "@/components/blocks/create-forms/tokenized-deposits/form";
import type { AssetType } from "@/lib/utils/typebox/asset-types";

interface RelatedProps {
  assettype: AssetType;
}

export function AddButton({ assettype }: RelatedProps) {
  switch (assettype) {
    case "bond":
      return <CreateBondForm asButton />;
    case "cryptocurrency":
      return <CreateCryptoCurrencyForm asButton />;
    case "stablecoin":
      return <CreateStablecoinForm asButton />;
    case "tokenizeddeposit":
      return <CreateTokenizedDepositForm asButton />;
    case "equity":
      return <CreateEquityForm asButton />;
    case "fund":
      return <CreateFundForm asButton />;
    default:
      throw new Error("Invalid asset type");
  }
}
