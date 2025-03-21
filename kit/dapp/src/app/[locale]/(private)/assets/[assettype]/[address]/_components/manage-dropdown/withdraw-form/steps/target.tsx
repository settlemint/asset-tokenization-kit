"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface TargetOption {
  value: "bond" | "yield";
  label: string;
}

export function Target() {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.target");

  // Create options for the select input
  const targetOptions: TargetOption[] = [
    { value: "bond", label: t("options.bond") },
    { value: "yield", label: t("options.yield") },
  ];

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSelect
        control={control}
        name="target"
        options={targetOptions}
        placeholder={t("placeholder")}
        className="w-full"
      />
    </FormStep>
  );
}

Target.validatedFields = ["target"] as const;