"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { TokenType as TokenTypeEnum } from "@/lib/db/regulations/schema-mica-regulation-configs";
import type { UpdateReservesSchema } from "@/lib/mutations/regulations/mica/update-reserves/update-reserves-schema";
import type { StaticDecode } from "@/lib/utils/typebox";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

type UpdateReservesInput = StaticDecode<
  ReturnType<typeof UpdateReservesSchema>
>;

export function TokenType() {
  const t = useTranslations(
    "regulations.mica.dashboard.reserve-status.form.fields.token-type"
  );
  const { control } = useFormContext<UpdateReservesInput>();

  const tokenTypeOptions = [
    {
      value: TokenTypeEnum.ELECTRONIC_MONEY_TOKEN,
      label: t("options.electronic-money"),
    },
    {
      value: TokenTypeEnum.ASSET_REFERENCED_TOKEN,
      label: t("options.asset-referenced-token"),
    },
  ];

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="space-y-4">
        <FormSelect
          control={control}
          name="tokenType"
          label={t("title")}
          description={t("description")}
          options={tokenTypeOptions}
          required
        />
      </div>
    </FormStep>
  );
}

// Add validated fields for form step validation
TokenType.validatedFields = [
  "tokenType",
] satisfies (keyof UpdateReservesInput)[];
