import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { Address } from "viem";
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
      // TODO: Implement push airdrop details when push airdrop queries are available
      throw new Error("Push airdrop details not yet implemented");
    default:
      exhaustiveGuard(airdroptype);
  }
}
