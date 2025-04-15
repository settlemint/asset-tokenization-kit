import { CreateBondForm } from "@/components/blocks/create-forms/bond/form";
import { CreateCryptoCurrencyForm } from "@/components/blocks/create-forms/cryptocurrency/form";
import { CreateDepositForm } from "@/components/blocks/create-forms/deposit/form";
import { CreateEquityForm } from "@/components/blocks/create-forms/equity/form";
import { CreateFundForm } from "@/components/blocks/create-forms/fund/form";
import { CreateStablecoinForm } from "@/components/blocks/create-forms/stablecoin/form";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
interface RelatedProps {
  assettype: AssetType;
}

export async function AddButton({ assettype }: RelatedProps) {
  switch (assettype) {
    case "bond":
      return <CreateBondForm asButton />;
    case "cryptocurrency":
      return <CreateCryptoCurrencyForm asButton />;
    case "stablecoin":
      return <CreateStablecoinForm asButton />;
    case "deposit":
      return <CreateDepositForm asButton />;
    case "equity":
      return <CreateEquityForm asButton />;
    case "fund":
      return <CreateFundForm asButton />;
    default:
      throw new Error("Invalid asset type");
  }
}
