import type { Step } from "@/components/blocks/step-wizard/step-wizard";

// Dynamically import airdrop form configurations
export const airdropForms = {
  standard: () =>
    import("./create-forms/standard-airdrop/form").then((m) => {
      return {
        default: m.standardAirdropFormDefinition,
      };
    }),
  vesting: () =>
    import("./create-forms/vesting-airdrop/form").then((m) => {
      return {
        default: m.vestingAirdropFormDefinition,
      };
    }),
  push: () =>
    import("./create-forms/push-airdrop/form").then((m) => {
      return {
        default: m.pushAirdropFormDefinition,
      };
    }),
} as const;

export interface AirdropFormDefinition {
  steps: Step[];
}
