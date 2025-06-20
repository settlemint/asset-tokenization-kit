import { AirdropType } from "@/lib/utils/typebox/airdrop-types";

// Helper functions to get title and description translation keys
export function getAirdropTitle(airdropType: AirdropType | null) {
  switch (airdropType) {
    case "standard":
      return "type-selection.types.standard.title" as const;
    case "vesting":
      return "type-selection.types.vesting.title" as const;
    case "push":
      return "type-selection.types.push.title" as const;
    default:
      return "type-selection.title" as const;
  }
}

export function getAirdropDescription(airdropType: AirdropType | null) {
  switch (airdropType) {
    case "standard":
      return "type-selection.types.standard.description" as const;
    case "vesting":
      return "type-selection.types.vesting.description" as const;
    case "push":
      return "type-selection.types.push.description" as const;
    default:
      return "type-selection.description" as const;
  }
}
