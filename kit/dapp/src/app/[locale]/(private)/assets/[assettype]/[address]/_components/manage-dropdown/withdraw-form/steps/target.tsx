"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { WithdrawInput } from "@/lib/mutations/withdraw/withdraw-schema";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface TargetProps {
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
}

export function Target({ bondDetails }: TargetProps) {
  const { control, setValue, watch } = useFormContext<WithdrawInput>();
  const t = useTranslations("private.assets.details.forms.target");
  const target = watch("target");
  const address = watch("address");

  // Update target and underlying asset addresses when target changes
  useEffect(() => {
    if (target === "bond") {
      setValue("targetAddress", address);
      setValue("underlyingAssetAddress", bondDetails.underlyingAsset.id);
      setValue("underlyingAssetType", bondDetails.underlyingAsset.type);
    } else if (target === "yield" && bondDetails.yieldSchedule) {
      setValue("targetAddress", bondDetails.yieldSchedule.id);
      setValue("underlyingAssetAddress", bondDetails.yieldSchedule.underlyingAsset.id);
      setValue("underlyingAssetType", bondDetails.yieldSchedule.underlyingAsset.type);
    }
  }, [target, address, bondDetails, setValue]);

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