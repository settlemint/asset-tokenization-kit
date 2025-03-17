import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import type { fundClasses } from "@/lib/utils/zod";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function FundClassesSelect({ label }: { label: string }) {
  const { control } = useFormContext<CreateFundInput>();
  const t = useTranslations("private.assets.fields");

  const translatedFundClasses: {
    value: (typeof fundClasses)[number];
    label: string;
  }[] = [
    {
      value: "ABSOLUTE_RETURN",
      label: t("funds.classes.absolute-return"),
    },
    {
      value: "CORE_BLEND",
      label: t("funds.classes.core-blend"),
    },
    {
      value: "DIVERSIFIED",
      label: t("funds.classes.diversified"),
    },
    {
      value: "INCOME_FOCUSED",
      label: t("funds.classes.income-focused"),
    },
    {
      value: "LARGE_CAP",
      label: t("funds.classes.large-cap"),
    },
    {
      value: "LONG_EQUITY",
      label: t("funds.classes.long-equity"),
    },
    {
      value: "LONG_SHORT_EQUITY",
      label: t("funds.classes.long-short-equity"),
    },
    {
      value: "MARKET_NEUTRAL",
      label: t("funds.classes.market-neutral"),
    },
    {
      value: "MID_CAP",
      label: t("funds.classes.mid-cap"),
    },
    {
      value: "PRE_SERIES_B",
      label: t("funds.classes.pre-series-b"),
    },
    {
      value: "SERIES_B_LATE_STAGE",
      label: t("funds.classes.series-b-late-stage"),
    },
    {
      value: "SHORT_EQUITY",
      label: t("funds.classes.short-equity"),
    },
    {
      value: "SMALL_CAP",
      label: t("funds.classes.small-cap"),
    },
  ];

  return (
    <FormSelect
      control={control}
      name="fundClass"
      label={label}
      options={translatedFundClasses.sort((a, b) =>
        a.label.localeCompare(b.label)
      )}
      required
    />
  );
}
