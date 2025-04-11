"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface TargetProps {
  onTargetChange?: (target: "bond" | "yield") => void;
}

export function Target({ onTargetChange}: TargetProps) {
  const { control, watch } = useFormContext<WithdrawInput>();
  const target = watch("target");
  const t = useTranslations("private.assets.details.forms.target");

  // Update target and underlying asset addresses when target changes
  useEffect(() => {
    // Notify parent component when target changes
    onTargetChange?.(target);
  }, [target, onTargetChange]);

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