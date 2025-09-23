import { AssetTypeBadge } from "@/components/assets/asset-type-badge";
import { DataTable } from "@/components/data-table/data-table";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { createStrictColumnHelper } from "@/components/data-table/utils/typed-column-helper";
import { orpc } from "@/orpc/orpc-client";
import type { StatsPortfolioDetailsOutput } from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import type { FiatCurrency } from "@atk/zod/fiat-currency";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type PortfolioBreakdownItem =
  StatsPortfolioDetailsOutput["tokenFactoryBreakdown"][number];

const columnHelper = createStrictColumnHelper<PortfolioBreakdownItem>();

interface PortfolioBreakdownTableProps {
  breakdown: StatsPortfolioDetailsOutput["tokenFactoryBreakdown"];
}

/**
 * Portfolio breakdown table component using the standard DataTable infrastructure
 * Displays asset types with their values, percentages, and asset counts
 */
export function PortfolioBreakdownTable({
  breakdown,
}: PortfolioBreakdownTableProps) {
  const { t } = useTranslation("stats");
  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  const columns = useMemo(
    () =>
      withAutoFeatures([
        columnHelper.display({
          id: "assetType",
          header: t("charts.portfolio.breakdown.assetType"),
          cell: ({ row }) => {
            return <AssetTypeBadge assetType={row.original.assetType} />;
          },
          meta: {
            displayName: t("charts.portfolio.breakdown.assetType"),
            type: "none",
          },
        }),
        columnHelper.accessor("totalValue", {
          id: "totalValue",
          header: t("charts.portfolio.breakdown.value"),
          meta: {
            displayName: t("charts.portfolio.breakdown.value"),
            type: "currency",
            currency: baseCurrency as FiatCurrency,
          },
        }),
        columnHelper.accessor("percentage", {
          id: "percentage",
          header: t("charts.portfolio.breakdown.percentage"),
          meta: {
            displayName: t("charts.portfolio.breakdown.percentage"),
            type: "percentage",
          },
        }),
        columnHelper.accessor("tokenBalancesCount", {
          header: t("charts.portfolio.breakdown.assets"),
          meta: {
            displayName: t("charts.portfolio.breakdown.assets"),
            type: "number",
          },
        }),
      ] as ColumnDef<PortfolioBreakdownItem>[]),
    [t, baseCurrency]
  );

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">
        {t("charts.portfolio.breakdown.detailsTitle")}
      </h4>
      <DataTable
        name="portfolio-breakdown"
        columns={columns}
        data={breakdown}
        pagination={{ enablePagination: false }}
        bulkActions={{ enabled: false }}
        urlState={{ enabled: false }}
        toolbar={{ enableToolbar: false }}
      />
    </div>
  );
}
