"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { TopUpInput } from "@/lib/mutations/bond/top-up/top-up-schema";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface TargetProps {
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
}

export function Target({ bondDetails }: TargetProps) {
  const { setValue, watch } = useFormContext<TopUpInput>();
  const t = useTranslations("private.assets.details.forms.target");
  const [target, address] = watch(["target", "address"]);

  // Update target and underlying asset addresses when target changes
  useEffect(() => {
    if (target === "bond") {
      setValue("targetAddress", address);
      setValue("underlyingAssetAddress", bondDetails.underlyingAsset.id);
      setValue("underlyingAssetType", bondDetails.underlyingAsset.type);
    } else {
      setValue("targetAddress", bondDetails.yieldSchedule?.id ?? address);
      setValue("underlyingAssetAddress", bondDetails.yieldSchedule?.underlyingAsset?.id ?? bondDetails.underlyingAsset.id);
      setValue("underlyingAssetType", bondDetails.yieldSchedule?.underlyingAsset?.type ?? bondDetails.underlyingAsset.type);
    }
  }, [target, address, bondDetails, setValue]);

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSelect
        name="target"
        control={useFormContext<TopUpInput>().control}
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