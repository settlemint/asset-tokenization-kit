import {
  SelectField,
  type SelectFieldProps,
} from "@/components/form/select-field";
import type { AssetType } from "@atk/zod/asset-types";
import { equityClasses } from "@atk/zod/equity-classes";
import { fundClasses } from "@atk/zod/fund-classes";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetClassSelectFieldProps extends SelectFieldProps {
  assetType: AssetType;
}

const EQUITY_CLASSES = equityClasses.map((assetClass) => ({
  value: assetClass,
  label: (t: TFunction<"tokens">) =>
    t(
      `assetClassification.equity.classes.${assetClass.toLowerCase() as Lowercase<typeof assetClass>}`
    ),
}));

const FUND_CLASSES = fundClasses.map((assetClass) => ({
  value: assetClass,
  label: (t: TFunction<"tokens">) =>
    t(
      `assetClassification.funds.classes.${assetClass.toLowerCase() as Lowercase<typeof assetClass>}`
    ),
}));

export function AssetClassSelectField({
  label,
  assetType,
  ...props
}: AssetClassSelectFieldProps) {
  const { t } = useTranslation(["tokens"]);
  const values = assetType === "equity" ? EQUITY_CLASSES : FUND_CLASSES;

  const options = useMemo(
    () =>
      values
        .map((value) => ({
          value: value.value,
          label: value.label(t),
        }))
        .toSorted((a, b) => a.label.localeCompare(b.label)),
    [values, t]
  );

  return <SelectField label={label} options={options} {...props} />;
}
