"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { defineMeta, filterFn } from "@/lib/filters";
import type { getFundList } from "@/lib/queries/fund/fund-list";
import { formatNumber } from "@/lib/utils/number";
import { fundCategories } from "@/lib/utils/typebox/fund-categories";
import { fundClasses } from "@/lib/utils/typebox/fund-classes";
import type { ColumnMeta } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ActivityIcon,
  AsteriskIcon,
  CoinsIcon,
  DollarSignIcon,
  LayersIcon,
  MoreHorizontal,
  PercentIcon,
  ShapesIcon,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getFundList>>[number]>();

const ASSET_STATUSES_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

type FundCategory = (typeof fundCategories)[number];
type FundClass = (typeof fundClasses)[number];

export function FundColumns() {
  const t = useTranslations("private.assets.fields");
  const locale = useLocale();
  const tAssetStatus = useTranslations("asset-status");

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
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.id, {
        displayName: t("address-header"),
        icon: WalletIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("name", {
      header: t("name-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.name, {
        displayName: t("name-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("symbol", {
      header: t("symbol-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.symbol, {
        displayName: t("symbol-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor((row) => row.price.amount, {
      header: t("price-header"),
      cell: ({ row }) =>
        formatNumber(row.original.price.amount, {
          currency: row.original.price.currency,
          decimals: 2,
          locale: locale,
        }),
      enableColumnFilter: false,
      meta: defineMeta((row) => row.price.amount, {
        displayName: t("price-header"),
        icon: DollarSignIcon,
        type: "number",
      }),
    }),
    columnHelper.accessor("totalSupply", {
      header: t("total-supply-header"),
      cell: ({ getValue }) => formatNumber(getValue(), { locale }),
      enableColumnFilter: true,
      filterFn: filterFn("number"),
      meta: defineMeta((row) => Number(row.totalSupply), {
        displayName: t("total-supply-header"),
        icon: CoinsIcon,
        type: "number",
        variant: "numeric",
      }),
    }),
    columnHelper.accessor("assetsUnderManagement", {
      header: t("assets-under-management-header"),
      cell: ({ getValue }) => formatNumber(getValue(), { locale }),
      enableColumnFilter: true,
      filterFn: filterFn("number"),
      meta: defineMeta((row) => Number(row.assetsUnderManagement), {
        displayName: t("assets-under-management-header"),
        icon: CoinsIcon,
        type: "number",
        variant: "numeric",
      }),
    }),
    columnHelper.accessor("fundCategory", {
      header: t("category-header"),
      cell: ({ getValue }) => translatedFundCategories[getValue()],
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.fundCategory, {
        displayName: t("category-header"),
        icon: LayersIcon,
        type: "option",
        options: fundCategories.map((cat: FundCategory) => ({
          label: translatedFundCategories[cat],
          value: cat,
        })),
      }),
    }),
    columnHelper.accessor("fundClass", {
      header: t("class-header"),
      cell: ({ getValue }) => translatedFundClasses[getValue()],
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.fundClass, {
        displayName: t("class-header"),
        icon: ShapesIcon,
        type: "option",
        options: fundClasses.map((cls: FundClass) => ({
          label: translatedFundClasses[cls],
          value: cls,
        })),
      }),
    }),
    columnHelper.accessor("managementFeeBps", {
      header: t("management-fee-header"),
      cell: ({ getValue }) => `${getValue() / 100}% (${getValue()} bps)`,
      enableColumnFilter: true,
      filterFn: filterFn("number"),
      meta: defineMeta((row) => row.managementFeeBps, {
        displayName: t("management-fee-header"),
        icon: PercentIcon,
        type: "number",
        variant: "numeric",
      }),
    }),
    columnHelper.accessor((row) => (row.paused ? "paused" : "active"), {
      header: t("status-header"),
      cell: ({ row }) => {
        return <ActivePill paused={row.original.paused} />;
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => (row.paused ? "paused" : "active"), {
        displayName: t("status-header"),
        icon: ActivityIcon,
        type: "option",
        options: ASSET_STATUSES_OPTIONS.map((status) => ({
          label: tAssetStatus(status.value as any),
          value: status.value,
        })),
      }),
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
        displayName: t("actions-header"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as ColumnMeta<Awaited<ReturnType<typeof getFundList>>[number], unknown>,
    }),
  ];
}
