import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { CreateVestingAirdropInput } from "@/lib/mutations/airdrop/create/vesting/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Basics() {
  const { control } = useFormContext<CreateVestingAirdropInput>();
  const t = useTranslations("private.airdrops.create");

  return (
    <FormStep
      title={t(stepDefinition.title)}
      description={t(stepDefinition.description)}
      contentClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full pt-6">
        <FormAssets
          control={control}
          name="asset"
          label={t("basics.asset-label")}
          placeholder={t("basics.asset-placeholder")}
          description={t("basics.asset-description")}
          required
        />
        <FormUsers
          control={control}
          name="owner"
          label={t("basics.owner-label")}
          placeholder={t("basics.owner-placeholder")}
          description={t("basics.owner-description")}
          required
        />
      </div>
    </FormStep>
  );
}

Basics.validatedFields = [
  "asset",
  "owner",
] satisfies (keyof CreateVestingAirdropInput)[];

export const stepDefinition = {
  id: "basics",
  title: "basics.title",
  description: "basics.description",
  component: Basics,
} as const;
