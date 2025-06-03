import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Address } from "viem";
import { PushAirdropDetails } from "./details/push";
import { StandardAirdropDetails } from "./details/standard";
import { VestingAirdropDetails } from "./details/vesting";

interface DetailsProps {
  address: Address;
  airdroptype: AirdropType;
}

export async function Details({ address, airdroptype }: DetailsProps) {
  switch (airdroptype) {
    case "standard":
      return <StandardAirdropDetails address={address} />;
    case "vesting":
      return <VestingAirdropDetails address={address} />;
    case "push":
      return <PushAirdropDetails address={address} />;
    default:
      exhaustiveGuard(airdroptype);
  }
}
