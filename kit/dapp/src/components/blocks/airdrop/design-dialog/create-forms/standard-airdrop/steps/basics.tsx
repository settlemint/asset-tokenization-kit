import { FormStep } from "@/components/blocks/form/form-step";
import { FormAssets } from "@/components/blocks/form/inputs/form-assets";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { CreateStandardAirdropInput } from "@/lib/mutations/airdrop/create/standard/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Basics() {
  const { control } = useFormContext<CreateStandardAirdropInput>();
  const t = useTranslations("private.airdrops.create.basics");

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full pt-6">
        <FormAssets
          control={control}
          name="asset"
          label={t("asset-label")}
          placeholder={t("asset-placeholder")}
          description={t("asset-description")}
          required
        />
        <FormUsers
          control={control}
          name="owner"
          label={t("owner-label")}
          placeholder={t("owner-placeholder")}
          description={t("owner-description")}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full pt-6">
        <FormInput
          control={control}
          type="datetime-local"
          name="startTime"
          label={t("start-time-label")}
          description={t("start-time-description")}
          required
        />
        <FormInput
          control={control}
          type="datetime-local"
          name="endTime"
          label={t("end-time-label")}
          description={t("end-time-description")}
          required
        />
      </div>
    </FormStep>
  );
}

Basics.validatedFields = [
  "asset",
  "owner",
  "startTime",
  "endTime",
] satisfies (keyof CreateStandardAirdropInput)[];
