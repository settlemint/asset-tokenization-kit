import { FormStep } from "@/components/blocks/form/form-step";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateEquityInput>();
  const t = useTranslations("admin.equities.create-form.configuration");

  // Equity classes based on the new structure
  const equityClasses = [
    { value: "COMMON_EQUITY", label: t("class-common-equity") },
    { value: "PREFERRED_EQUITY", label: t("class-preferred-equity") },
    {
      value: "MARKET_CAPITALIZATION_EQUITY",
      label: t("class-market-capitalization-equity"),
    },
    { value: "GEOGRAPHIC_EQUITY", label: t("class-geographic-equity") },
    {
      value: "SECTOR_INDUSTRY_EQUITY",
      label: t("class-sector-industry-equity"),
    },
    {
      value: "INVESTMENT_STYLE_EQUITY",
      label: t("class-investment-style-equity"),
    },
    {
      value: "INVESTMENT_STAGE_PRIVATE_EQUITY",
      label: t("class-investment-stage-private-equity"),
    },
    {
      value: "SPECIAL_CLASSES_EQUITY",
      label: t("class-special-classes-equity"),
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  // Equity categories based on the new structured list
  const equityCategories = [
    // Common Equity
    { value: "VOTING_COMMON_STOCK", label: t("category-voting-common-stock") },
    {
      value: "NON_VOTING_COMMON_STOCK",
      label: t("category-non-voting-common-stock"),
    },

    // Preferred Equity
    {
      value: "CUMULATIVE_PREFERRED_STOCK",
      label: t("category-cumulative-preferred-stock"),
    },
    {
      value: "NON_CUMULATIVE_PREFERRED_STOCK",
      label: t("category-non-cumulative-preferred-stock"),
    },
    {
      value: "CONVERTIBLE_PREFERRED_STOCK",
      label: t("category-convertible-preferred-stock"),
    },
    {
      value: "REDEEMABLE_PREFERRED_STOCK",
      label: t("category-redeemable-preferred-stock"),
    },

    // Market Capitalization Equity
    { value: "LARGE_CAP_EQUITY", label: t("category-large-cap-equity") },
    { value: "MID_CAP_EQUITY", label: t("category-mid-cap-equity") },
    { value: "SMALL_CAP_EQUITY", label: t("category-small-cap-equity") },
    { value: "MICRO_CAP_EQUITY", label: t("category-micro-cap-equity") },

    // Geographic Equity
    { value: "DOMESTIC_EQUITY", label: t("category-domestic-equity") },
    {
      value: "INTERNATIONAL_EQUITY",
      label: t("category-international-equity"),
    },
    { value: "GLOBAL_EQUITY", label: t("category-global-equity") },
    {
      value: "EMERGING_MARKET_EQUITY",
      label: t("category-emerging-market-equity"),
    },
    {
      value: "FRONTIER_MARKET_EQUITY",
      label: t("category-frontier-market-equity"),
    },

    // Sector/Industry Equity
    { value: "TECHNOLOGY", label: t("category-technology") },
    { value: "FINANCIALS", label: t("category-financials") },
    { value: "HEALTHCARE", label: t("category-healthcare") },
    { value: "ENERGY", label: t("category-energy") },
    { value: "CONSUMER_STAPLES", label: t("category-consumer-staples") },
    {
      value: "CONSUMER_DISCRETIONARY",
      label: t("category-consumer-discretionary"),
    },
    { value: "INDUSTRIALS", label: t("category-industrials") },
    { value: "MATERIALS", label: t("category-materials") },
    { value: "UTILITIES", label: t("category-utilities") },
    {
      value: "COMMUNICATION_SERVICES",
      label: t("category-communication-services"),
    },
    { value: "REAL_ESTATE", label: t("category-real-estate") },

    // Investment Style Equity
    { value: "GROWTH_EQUITY", label: t("category-growth-equity") },
    { value: "VALUE_EQUITY", label: t("category-value-equity") },
    { value: "BLEND_EQUITY", label: t("category-blend-equity") },
    { value: "INCOME_EQUITY", label: t("category-income-equity") },

    // Investment Stage (Private Equity)
    { value: "VENTURE_CAPITAL", label: t("category-venture-capital") },
    { value: "GROWTH_CAPITAL", label: t("category-growth-capital") },
    { value: "LEVERAGED_BUYOUTS", label: t("category-leveraged-buyouts") },
    { value: "MEZZANINE_FINANCING", label: t("category-mezzanine-financing") },
    { value: "DISTRESSED_EQUITY", label: t("category-distressed-equity") },

    // Special Classes of Equity
    { value: "RESTRICTED_STOCK", label: t("category-restricted-stock") },
    { value: "ESOP_SHARES", label: t("category-esop-shares") },
    { value: "TRACKING_STOCKS", label: t("category-tracking-stocks") },
    { value: "DUAL_CLASS_SHARES", label: t("category-dual-class-shares") },
  ].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-2 gap-6">
        <FormSelect
          control={control}
          name="equityClass"
          label={t("equity-class-label")}
          options={equityClasses}
        />
        <FormSelect
          control={control}
          name="equityCategory"
          label={t("equity-category-label")}
          options={equityCategories}
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  "equityCategory",
  "equityClass",
  "managementFeeBps",
] as const;
