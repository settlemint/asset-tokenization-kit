import { CreateBondForm } from "@/components/blocks/create-forms/bonds/form";
import { CreateCryptoCurrencyForm } from "@/components/blocks/create-forms/cryptocurrencies/form";
import { CreateEquityForm } from "@/components/blocks/create-forms/equities/form";
import { CreateFundForm } from "@/components/blocks/create-forms/funds/form";
import { CreateStablecoinForm } from "@/components/blocks/create-forms/stablecoins/form";
import { CreateTokenizedDepositForm } from "@/components/blocks/create-forms/tokenized-deposits/form";
import { getCurrentUserDetail } from "@/lib/queries/user/current-user-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
interface RelatedProps {
  assettype: AssetType;
}

export async function AddButton({ assettype }: RelatedProps) {
  const userDetails = await getCurrentUserDetail();
  switch (assettype) {
    case "bond":
      return <CreateBondForm asButton userDetails={userDetails} />;
    case "cryptocurrency":
      return <CreateCryptoCurrencyForm asButton userDetails={userDetails} />;
    case "stablecoin":
      return <CreateStablecoinForm asButton userDetails={userDetails} />;
    case "tokenizeddeposit":
      return <CreateTokenizedDepositForm asButton userDetails={userDetails} />;
    case "equity":
      return <CreateEquityForm asButton userDetails={userDetails} />;
    case "fund":
      return <CreateFundForm asButton userDetails={userDetails} />;
    default:
      throw new Error("Invalid asset type");
  }
}
