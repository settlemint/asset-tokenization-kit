import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { CreatePushAirdropInput } from "@/lib/mutations/airdrop/create/push/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Distribution as BaseDistribution } from "../../common/distribution";

export function Distribution() {
  const { control } = useFormContext<CreatePushAirdropInput>();
  const t = useTranslations("private.airdrops.create.distribution");

  return (
    <BaseDistribution>
      <div className="mb-6">
        <FormInput
          control={control}
          type="number"
          name="distributionCap"
          label={t("distribution-cap-label")}
          description={t("distribution-cap-description")}
          required
        />
      </div>
    </BaseDistribution>
  );
}

Distribution.validatedFields = [
  "distribution",
  "distributionCap",
] satisfies (keyof CreatePushAirdropInput)[];
