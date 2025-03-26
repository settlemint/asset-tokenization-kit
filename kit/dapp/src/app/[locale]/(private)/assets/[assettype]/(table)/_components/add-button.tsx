import { CreateBondForm } from "@/components/blocks/create-forms/bond/form";
import { CreateCryptoCurrencyForm } from "@/components/blocks/create-forms/cryptocurrency/form";
import { CreateDepositForm } from "@/components/blocks/create-forms/deposit/form";
import { CreateEquityForm } from "@/components/blocks/create-forms/equity/form";
import { CreateFundForm } from "@/components/blocks/create-forms/fund/form";
import { CreateStablecoinForm } from "@/components/blocks/create-forms/stablecoin/form";
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
    case "deposit":
      return <CreateDepositForm asButton userDetails={userDetails} />;
    case "equity":
      return <CreateEquityForm asButton userDetails={userDetails} />;
    case "fund":
      return <CreateFundForm asButton userDetails={userDetails} />;
    default:
      throw new Error("Invalid asset type");
  }
}
