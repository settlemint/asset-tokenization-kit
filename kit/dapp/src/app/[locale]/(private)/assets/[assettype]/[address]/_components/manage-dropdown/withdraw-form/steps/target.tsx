"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface TargetProps {
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
}

export function Target({ bondDetails }: TargetProps) {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.target");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSelect
        name="target"
        control={control}
        options={[
          {
            value: "bond",
            label: t("options.bond"),
          },
          {
            value: "yield",
            label: t("options.yield"),
          },
        ]}
        placeholder={t("placeholder")}
        className="w-full"
      />
    </FormStep>
  );
}

Target.validatedFields = ["target"] as const;
