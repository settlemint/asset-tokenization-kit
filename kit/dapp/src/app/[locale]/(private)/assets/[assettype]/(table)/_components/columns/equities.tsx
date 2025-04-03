"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { defineMeta, filterFn } from "@/lib/filters";
import type { getEquityList } from "@/lib/queries/equity/equity-list";
import { formatNumber } from "@/lib/utils/number";
import { equityCategories } from "@/lib/utils/typebox/equity-categories";
import { equityClasses } from "@/lib/utils/typebox/equity-classes";
import type { CellContext } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ActivityIcon,
  AsteriskIcon,
  CoinsIcon,
  DollarSignIcon,
  LayersIcon,
  MoreHorizontal,
  ShapesIcon,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Equity = Awaited<ReturnType<typeof getEquityList>>[number];

const columnHelper = createColumnHelper<Equity>();

type EquityCategory = (typeof equityCategories)[number];
type EquityClass = (typeof equityClasses)[number];

const ASSET_STATUSES_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

export function equityColumns() {
  const t = useTranslations("private.assets.fields");
  const tAssetStatus = useTranslations("asset-status");
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
    columnHelper.accessor("equityCategory", {
      header: t("category-header"),
      cell: ({ getValue }: CellContext<Equity, EquityCategory>) =>
        translatedEquityCategories[getValue()],
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.equityCategory, {
        displayName: t("category-header"),
        icon: LayersIcon,
        type: "option",
        options: equityCategories.map((cat: EquityCategory) => ({
          label: translatedEquityCategories[cat],
          value: cat,
        })),
      }),
    }),
    columnHelper.accessor("equityClass", {
      header: t("class-header"),
      cell: ({ getValue }: CellContext<Equity, EquityClass>) =>
        translatedEquityClasses[getValue()],
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.equityClass, {
        displayName: t("class-header"),
        icon: ShapesIcon,
        type: "option",
        options: equityClasses.map((cls: EquityClass) => ({
          label: translatedEquityClasses[cls],
          value: cls,
        })),
      }),
    }),
    columnHelper.accessor((row) => (row.paused ? "paused" : "active"), {
      header: t("status-header"),
      cell: ({ row }: CellContext<Equity, string>) => {
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
      cell: ({ row }: CellContext<Equity, unknown>) => {
        return (
          <DataTableRowActions
            detailUrl={`/assets/equity/${row.original.id}`}
          />
        );
      },
      meta: {
        displayName: t("actions-header"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as any,
    }),
  ];
}
