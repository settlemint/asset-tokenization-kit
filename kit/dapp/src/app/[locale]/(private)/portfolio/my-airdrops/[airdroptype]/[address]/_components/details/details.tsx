import { getUser } from "@/lib/auth/utils";
import { getUserStandardAirdropDetail } from "@/lib/queries/standard-airdrop/user-standard-airdrop-detail";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Address } from "viem";

interface DetailsProps {
  address: Address;
  type: AirdropType;
}

export async function MyAirdropDetails({ address, type }: DetailsProps) {
  const user = await getUser();

  switch (type) {
    case "standard":
      const airdropDetails = await getUserStandardAirdropDetail(address, user);
      console.log(airdropDetails);
      return <div></div>;
    case "vesting":
      return <div></div>;
    case "push":
      return <div></div>;
    default:
      exhaustiveGuard(type);
  }
}
