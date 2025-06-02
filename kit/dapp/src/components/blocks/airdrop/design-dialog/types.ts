import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { useTranslations } from "next-intl";

type TranslationKeys = Parameters<
  ReturnType<typeof useTranslations<"private.airdrops.create">>
>[0];

export interface AirdropFormDefinition {
  readonly steps: readonly {
    readonly id: string;
    readonly title: TranslationKeys;
    readonly description: TranslationKeys;
  }[];
}

export const airdropForms: Record<
  NonNullable<AirdropType>,
  () => Promise<{ default: AirdropFormDefinition }>
> = {
  standard: () =>
    import("./create-forms/standard-airdrop/form").then((m) => ({
      default: m.standardAirdropFormDefinition,
    })),
  vesting: () =>
    import("./create-forms/vesting-airdrop/form").then((m) => ({
      default: m.vestingAirdropFormDefinition,
    })),
  push: () =>
    import("./create-forms/push-airdrop/form").then((m) => ({
      default: m.pushAirdropFormDefinition,
    })),
};
