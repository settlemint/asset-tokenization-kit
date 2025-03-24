import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import type { fundCategories } from "@/lib/utils/typebox/fund-categories";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function FundCategoriesSelect({ label }: { label: string }) {
  const { control } = useFormContext<CreateFundInput>();
  const t = useTranslations("private.assets.fields");

  const translatedFundCategories: {
    value: (typeof fundCategories)[number];
    label: string;
  }[] = [
    {
      value: "ACTIVIST",
      label: t("funds.categories.activist"),
    },
    {
      value: "COMMODITY_TRADING",
      label: t("funds.categories.commodity-trading"),
    },
    {
      value: "CONVERTIBLE_ARBITRAGE",
      label: t("funds.categories.convertible-arbitrage"),
    },
    {
      value: "CURRENCY_FX",
      label: t("funds.categories.currency-fx"),
    },
    {
      value: "DISTRESSED_DEBT",
      label: t("funds.categories.distressed-debt"),
    },
    {
      value: "EMERGING_MARKETS",
      label: t("funds.categories.emerging-markets"),
    },
    {
      value: "EQUITY_HEDGE",
      label: t("funds.categories.equity-hedge"),
    },
    {
      value: "EVENT_DRIVEN",
      label: t("funds.categories.event-driven"),
    },
    {
      value: "FIXED_INCOME_ARBITRAGE",
      label: t("funds.categories.fixed-income-arbitrage"),
    },
    {
      value: "FUND_OF_FUNDS",
      label: t("funds.categories.fund-of-funds"),
    },
    {
      value: "GLOBAL_MACRO",
      label: t("funds.categories.global-macro"),
    },
    {
      value: "HIGH_FREQUENCY_TRADING",
      label: t("funds.categories.high-frequency-trading"),
    },
    {
      value: "MANAGED_FUTURES_CTA",
      label: t("funds.categories.managed-futures-cta"),
    },
    {
      value: "MARKET_NEUTRAL",
      label: t("funds.categories.market-neutral"),
    },
    {
      value: "MERGER_ARBITRAGE",
      label: t("funds.categories.merger-arbitrage"),
    },
    {
      value: "VENTURE_CAPITAL",
      label: t("funds.categories.venture-capital"),
    },
  ];

  return (
    <FormSelect
      control={control}
      name="fundCategory"
      label={label}
      options={translatedFundCategories.sort((a, b) =>
        a.label.localeCompare(b.label)
      )}
      required
    />
  );
}
