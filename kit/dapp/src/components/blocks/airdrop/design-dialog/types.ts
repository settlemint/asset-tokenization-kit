import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";

export interface Step {
  id: string;
  title: string; // This will be a translation key
  description: string; // This will be a translation key
}

export interface AirdropFormDefinition {
  steps: Step[];
  // Potentially add other common fields like initialValues, validationSchema later
}

// Dynamically import airdrop form configurations
export const airdropForms: Record<
  AirdropType,
  () => Promise<{ default: AirdropFormDefinition }>
> = {
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
};

export const typeSelectionStep = {
  id: "type",
  title: "airdrop-designer.type-selection.title",
  description: "airdrop-designer.type-selection.description",
};
