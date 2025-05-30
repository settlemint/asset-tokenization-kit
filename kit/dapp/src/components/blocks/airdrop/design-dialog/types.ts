import { pushAirdropFormDefinition } from "./create-forms/push-airdrop/form";
import { standardAirdropFormDefinition } from "./create-forms/standard-airdrop/form";
import { vestingAirdropFormDefinition } from "./create-forms/vesting-airdrop/form";

export const airdropForms = {
  standard: standardAirdropFormDefinition,
  vesting: vestingAirdropFormDefinition,
  push: pushAirdropFormDefinition,
} as const;
