import { getUser } from "@/lib/auth/utils";
import { getUserAirdropDetail } from "@/lib/queries/airdrop/user-airdrop-detail";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { Address } from "viem";
import { PushAirdropDetails } from "./push";
import { StandardAirdropDetails } from "./standard";
import { VestingAirdropDetails } from "./vesting";

interface DetailsProps {
  address: Address;
}

export async function MyAirdropDetails({ address }: DetailsProps) {
  const user = await getUser();
  const myAirdropDetails = await getUserAirdropDetail(address, user);

  switch (myAirdropDetails?.airdrop.__typename) {
    case "StandardAirdrop":
      return (
        <StandardAirdropDetails
          airdrop={myAirdropDetails.airdrop}
          amount={myAirdropDetails.amount.toString()}
          index={myAirdropDetails.index}
          price={myAirdropDetails.price}
        />
      );
    case "VestingAirdrop":
      return (
        <VestingAirdropDetails
          airdrop={myAirdropDetails.airdrop}
          amount={myAirdropDetails.amount.toString()}
          index={myAirdropDetails.index}
          price={myAirdropDetails.price}
        />
      );
    case "PushAirdrop":
      return (
        <PushAirdropDetails
          airdrop={myAirdropDetails.airdrop}
          amount={myAirdropDetails.amount.toString()}
          index={myAirdropDetails.index}
          price={myAirdropDetails.price}
        />
      );
    default:
      exhaustiveGuard(myAirdropDetails?.airdrop);
  }
}
