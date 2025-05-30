import type { CreatePushAirdropInput } from "@/lib/mutations/airdrop/create/push/create-schema";
import type { CreateStandardAirdropInput } from "@/lib/mutations/airdrop/create/standard/create-schema";
import type { CreateVestingAirdropInput } from "@/lib/mutations/airdrop/create/vesting/create-schema";
export type CreateAirdropInput =
  | CreatePushAirdropInput
  | CreateVestingAirdropInput
  | CreateStandardAirdropInput;
