"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { ColumnAssetStatus } from "@/components/blocks/asset-info/column-asset-status";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import type { getFundList } from "@/lib/queries/fund/fund-list";
import { formatNumber } from "@/lib/utils/number";
import type { fundCategories, fundClasses } from "@/lib/utils/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getFundList>>[number]>();

type FundCategory = (typeof fundCategories)[number];
type FundClass = (typeof fundClasses)[number];

export function fundColumns({ baseCurrency }: { baseCurrency: CurrencyCode }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.assets.fields");

  const translatedFundCategories: Record<FundCategory, string> = {
    ACTIVIST: t("funds.categories.activist"),
    COMMODITY_TRADING: t("funds.categories.commodity-trading"),
    CONVERTIBLE_ARBITRAGE: t("funds.categories.convertible-arbitrage"),
    CREDIT: t("funds.categories.credit"),
    CURRENCY_FX: t("funds.categories.currency-fx"),
    DISTRESSED_DEBT: t("funds.categories.distressed-debt"),
    EMERGING_MARKETS: t("funds.categories.emerging-markets"),
    EQUITY_HEDGE: t("funds.categories.equity-hedge"),
    EVENT_DRIVEN: t("funds.categories.event-driven"),
    FIXED_INCOME_ARBITRAGE: t("funds.categories.fixed-income-arbitrage"),
    FUND_OF_FUNDS: t("funds.categories.fund-of-funds"),
    GLOBAL_MACRO: t("funds.categories.global-macro"),
    HIGH_FREQUENCY_TRADING: t("funds.categories.high-frequency-trading"),
    MANAGED_FUTURES_CTA: t("funds.categories.managed-futures-cta"),
    MARKET_NEUTRAL: t("funds.categories.market-neutral"),
    MERGER_ARBITRAGE: t("funds.categories.merger-arbitrage"),
    MULTI_STRATEGY: t("funds.categories.multi-strategy"),
    PRIVATE_EQUITY: t("funds.categories.private-equity"),
    VENTURE_CAPITAL: t("funds.categories.venture-capital"),
  };

  const translatedFundClasses: Record<FundClass, string> = {
    ABSOLUTE_RETURN: t("funds.classes.absolute-return"),
    CORE_BLEND: t("funds.classes.core-blend"),
    DIVERSIFIED: t("funds.classes.diversified"),
    EARLY_STAGE: t("funds.classes.early-stage"),
    FACTOR_BASED: t("funds.classes.factor-based"),
    GROWTH_FOCUSED: t("funds.classes.growth-focused"),
    INCOME_FOCUSED: t("funds.classes.income-focused"),
    LARGE_CAP: t("funds.classes.large-cap"),
    LONG_EQUITY: t("funds.classes.long-equity"),
    LONG_SHORT_EQUITY: t("funds.classes.long-short-equity"),
    MARKET_NEUTRAL: t("funds.classes.market-neutral"),
    MID_CAP: t("funds.classes.mid-cap"),
    MOMENTUM_ORIENTED: t("funds.classes.momentum-oriented"),
    OPPORTUNISTIC: t("funds.classes.opportunistic"),
    PRE_SERIES_B: t("funds.classes.pre-series-b"),
    QUANTITATIVE_ALGORITHMIC: t("funds.classes.quantitative-algorithmic"),
    REGIONAL: t("funds.classes.regional"),
    SECTOR_SPECIFIC: t("funds.classes.sector-specific"),
    SEED_PRE_SEED: t("funds.classes.seed-pre-seed"),
    SERIES_B_LATE_STAGE: t("funds.classes.series-b-late-stage"),
    SHORT_EQUITY: t("funds.classes.short-equity"),
    SMALL_CAP: t("funds.classes.small-cap"),
    TACTICAL_ASSET_ALLOCATION: t("funds.classes.tactical-asset-allocation"),
    VALUE_FOCUSED: t("funds.classes.value-focused"),
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
    columnHelper.accessor("value_in_base_currency", {
      header: t("price-header"),
      cell: ({ getValue }) =>
        formatNumber(getValue(), {
          currency: baseCurrency,
          decimals: 2,
        }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("totalSupply", {
      header: t("total-supply-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue }) => formatNumber(getValue()),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("assetsUnderManagement", {
      header: t("assets-under-management-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue }) => formatNumber(getValue()),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("fundCategory", {
      header: t("category-header"),
      cell: ({ getValue }) => translatedFundCategories[getValue()],
      enableColumnFilter: true,
    }),
    columnHelper.accessor("fundClass", {
      header: t("class-header"),
      cell: ({ getValue }) => translatedFundClasses[getValue()],
      enableColumnFilter: true,
    }),
    columnHelper.accessor("managementFeeBps", {
      header: t("management-fee-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue }) => `${getValue() / 100}% (${getValue()} bps)`,
      enableColumnFilter: false,
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
          <DataTableRowActions detailUrl={`/assets/fund/${row.original.id}`} />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
