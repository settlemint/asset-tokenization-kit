import {
  SelectField,
  type SelectFieldProps,
} from "@/components/form/select-field";
import type { AssetType } from "@atk/zod/asset-types";
import { equityCategories } from "@atk/zod/equity-categories";
import { fundCategories } from "@atk/zod/fund-categories";
import { TFunction } from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface AssetCategorySelectFieldProps extends SelectFieldProps {
  assetType: AssetType;
}

const EQUITY_CATEGORIES = equityCategories.map((category) => ({
  value: category,
  label: (t: TFunction<"tokens">) =>
    t(
      `assetClassification.equity.categories.${category.toLowerCase() as Lowercase<typeof category>}`
    ),
}));

const FUND_CATEGORIES = fundCategories.map((category) => ({
  value: category,
  label: (t: TFunction<"tokens">) =>
    t(
      `assetClassification.funds.categories.${category.toLowerCase() as Lowercase<typeof category>}`
    ),
}));

export function AssetCategorySelectField({
  label,
  assetType,
  ...props
}: AssetCategorySelectFieldProps) {
  const { t } = useTranslation(["tokens"]);
  const values = assetType === "equity" ? EQUITY_CATEGORIES : FUND_CATEGORIES;

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
