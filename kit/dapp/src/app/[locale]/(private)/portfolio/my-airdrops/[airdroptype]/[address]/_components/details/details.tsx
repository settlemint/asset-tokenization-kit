import { getUser } from "@/lib/auth/utils";
import { getUserStandardAirdropDetail } from "@/lib/queries/standard-airdrop/user-standard-airdrop-detail";
import { getUserVestingAirdropDetail } from "@/lib/queries/vesting-airdrop/user-vesting-airdrop-detail";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Address } from "viem";
import { StandardAirdropDetails } from "./standard-airdrop/standard";
import { VestingAirdropDetails } from "./vesting-airdrop/vesting";

interface DetailsProps {
  address: Address;
  type: AirdropType;
}

export async function MyAirdropDetails({ address, type }: DetailsProps) {
  const user = await getUser();

  switch (type) {
    case "standard": {
      const standardAirdropDetails = await getUserStandardAirdropDetail(
        address,
        user
      );
      return <StandardAirdropDetails airdrop={standardAirdropDetails} />;
    }
    case "vesting": {
      const vestingAirdropDetails = await getUserVestingAirdropDetail(
        address,
        user
      );
      return <VestingAirdropDetails airdrop={vestingAirdropDetails} />;
    }
    case "push":
      return <div></div>;
    default:
      exhaustiveGuard(type);
  }
}
