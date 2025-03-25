"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { ColumnAssetStatus } from "@/components/blocks/asset-info/column-asset-status";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { getEquityList } from "@/lib/queries/equity/equity-list";
import { formatNumber } from "@/lib/utils/number";
import type { equityCategories } from "@/lib/utils/typebox/equity-categories";
import type { equityClasses } from "@/lib/utils/typebox/equity-classes";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getEquityList>>[number]>();

type EquityCategory = (typeof equityCategories)[number];
type EquityClass = (typeof equityClasses)[number];

export function equityColumns({
  baseCurrency,
}: {
  baseCurrency: CurrencyCode;
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.assets.fields");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

  const translatedEquityCategories: Record<EquityCategory, string> = {
    COMMON_EQUITY: t("equity.categories.common-equity"),
    VOTING_COMMON_STOCK: t("equity.categories.voting-common-stock"),
    NON_VOTING_COMMON_STOCK: t("equity.categories.non-voting-common-stock"),
    CUMULATIVE_PREFERRED_STOCK: t(
      "equity.categories.cumulative-preferred-stock"
    ),
    NON_CUMULATIVE_PREFERRED_STOCK: t(
      "equity.categories.non-cumulative-preferred-stock"
    ),
    CONVERTIBLE_PREFERRED_STOCK: t(
      "equity.categories.convertible-preferred-stock"
    ),
    REDEEMABLE_PREFERRED_STOCK: t(
      "equity.categories.redeemable-preferred-stock"
    ),
    LARGE_CAP_EQUITY: t("equity.categories.large-cap-equity"),
    MID_CAP_EQUITY: t("equity.categories.mid-cap-equity"),
    SMALL_CAP_EQUITY: t("equity.categories.small-cap-equity"),
    MICRO_CAP_EQUITY: t("equity.categories.micro-cap-equity"),
    DOMESTIC_EQUITY: t("equity.categories.domestic-equity"),
    INTERNATIONAL_EQUITY: t("equity.categories.international-equity"),
    GLOBAL_EQUITY: t("equity.categories.global-equity"),
    EMERGING_MARKET_EQUITY: t("equity.categories.emerging-market-equity"),
    FRONTIER_MARKET_EQUITY: t("equity.categories.frontier-market-equity"),
    TECHNOLOGY: t("equity.categories.technology"),
    FINANCIALS: t("equity.categories.financials"),
    HEALTHCARE: t("equity.categories.healthcare"),
    ENERGY: t("equity.categories.energy"),
    CONSUMER_STAPLES: t("equity.categories.consumer-staples"),
    CONSUMER_DISCRETIONARY: t("equity.categories.consumer-discretionary"),
    INDUSTRIALS: t("equity.categories.industrials"),
    MATERIALS: t("equity.categories.materials"),
    UTILITIES: t("equity.categories.utilities"),
    COMMUNICATION_SERVICES: t("equity.categories.communication-services"),
    REAL_ESTATE: t("equity.categories.real-estate"),
    GROWTH_EQUITY: t("equity.categories.growth-equity"),
    VALUE_EQUITY: t("equity.categories.value-equity"),
    BLEND_EQUITY: t("equity.categories.blend-equity"),
    INCOME_EQUITY: t("equity.categories.income-equity"),
    VENTURE_CAPITAL: t("equity.categories.venture-capital"),
    GROWTH_CAPITAL: t("equity.categories.growth-capital"),
    LEVERAGED_BUYOUTS: t("equity.categories.leveraged-buyouts"),
    MEZZANINE_FINANCING: t("equity.categories.mezzanine-financing"),
    DISTRESSED_EQUITY: t("equity.categories.distressed-equity"),
    RESTRICTED_STOCK: t("equity.categories.restricted-stock"),
    ESOP_SHARES: t("equity.categories.esop-shares"),
    TRACKING_STOCKS: t("equity.categories.tracking-stocks"),
    DUAL_CLASS_SHARES: t("equity.categories.dual-class-shares"),
  };

  const translatedEquityClasses: Record<EquityClass, string> = {
    COMMON_EQUITY: t("equity.classes.common-equity"),
    PREFERRED_EQUITY: t("equity.classes.preferred-equity"),
    MARKET_CAPITALIZATION_EQUITY: t(
      "equity.classes.market-capitalization-equity"
    ),
    GEOGRAPHIC_EQUITY: t("equity.classes.geographic-equity"),
    SECTOR_INDUSTRY_EQUITY: t("equity.classes.sector-industry-equity"),
    INVESTMENT_STYLE_EQUITY: t("equity.classes.investment-style-equity"),
    INVESTMENT_STAGE_PRIVATE_EQUITY: t(
      "equity.classes.investment-stage-private-equity"
    ),
    SPECIAL_CLASSES_EQUITY: t("equity.classes.special-classes-equity"),
  };

  return [
    columnHelper.accessor("id", {
      header: t("address-header"),
      cell: ({ getValue }) => (
        <EvmAddress address={getValue()} prettyNames={false}>
          <EvmAddressBalances address={getValue()} />
        </EvmAddress>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("name", {
      header: t("name-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("symbol", {
      header: t("symbol-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("price", {
      header: t("price-header"),
      cell: ({ getValue }) =>
        formatNumber(getValue().amount, {
          currency: getValue().currency,
          decimals: 2,
          locale: locale,
        }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("totalSupply", {
      header: t("total-supply-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue }) => formatNumber(getValue(), { locale }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("equityCategory", {
      header: t("category-header"),
      cell: ({ getValue }) => translatedEquityCategories[getValue()],
      enableColumnFilter: true,
    }),
    columnHelper.accessor("equityClass", {
      header: t("class-header"),
      cell: ({ getValue }) => translatedEquityClasses[getValue()],
      enableColumnFilter: true,
    }),
    columnHelper.accessor((row) => <ColumnAssetStatus assetOrBalance={row} />, {
      header: t("status-header"),
      cell: ({ row }) => {
        return <ActivePill paused={row.original.paused} />;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: t("actions-header"),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/assets/equity/${row.original.id}`}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
