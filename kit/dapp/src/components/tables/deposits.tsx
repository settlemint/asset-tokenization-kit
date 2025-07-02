import { createSelectionColumn } from "@/components/data-table/columns/selection-column";
import { DataTable } from "@/components/data-table/data-table";
import { useBulkActions } from "@/components/data-table/data-table-bulk-actions";
import {
  ActionsCell,
  type ActionItem,
} from "@/components/data-table/cells/actions-cell";
import { withAutoFeatures } from "@/components/data-table/utils/auto-column";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc";
import type { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Hash,
  Package,
  Plus,
  Type,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "@/components/data-table/filters/types/table-extensions";

type Token = TokenList[number];

const columnHelper = createColumnHelper<Token>();

// Constants to avoid inline array creation
const INITIAL_SORTING = [
  {
    id: "name",
    desc: false,
  },
];

interface DepositsTableProps {
  factoryAddress: string;
}

export function DepositsTable({ factoryAddress }: DepositsTableProps) {
  const router = useRouter();
  const { t } = useTranslation("general");
  // Get the current route's path pattern from the matched route
  const routePath =
    router.state.matches[router.state.matches.length - 1]?.pathname;

  const { data: tokensResponse } = useQuery({
    ...orpc.token.list.queryOptions({
      input: {
        tokenFactory: factoryAddress,
      },
    }),
  });

  const tokens = tokensResponse ?? [];

  // Factory function for row actions - defined inside component to access `t`
  const createRowActions = useCallback(
    (row: { original: Token }): ActionItem[] => [
      {
        label: t("components.deposits-table.actions.view-details"),
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          void router.navigate({
            to: "/token/$factoryAddress/$tokenAddress",
            params: {
              factoryAddress,
              tokenAddress: row.original.id,
            },
          });
        },
      },
      {
        label: t("components.deposits-table.actions.copy-address"),
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {
          void navigator.clipboard.writeText(row.original.id);
          toast.success(t("components.deposits-table.actions.address-copied"));
        },
      },
      {
        label: t("components.deposits-table.actions.view-on-etherscan"),
        icon: <ExternalLink className="h-4 w-4" />,
        href: `https://etherscan.io/token/${row.original.id}`,
        separator: "before",
      },
    ],
    [t, router, factoryAddress]
  );

  const handleArchive = useCallback(
    (selectedTokens: Token[]) => {
      toast.info(
        t("components.deposits-table.bulk-actions.archive-message", {
          count: selectedTokens.length,
        })
      );
    },
    [t]
  );

  const handleDuplicate = useCallback(
    (selectedTokens: Token[]) => {
      toast.info(
        t("components.deposits-table.bulk-actions.duplicate-message", {
          count: selectedTokens.length,
        })
      );
    },
    [t]
  );

  const { actions, actionGroups } = useBulkActions<Token>({
    onArchive: handleArchive,
    onDuplicate: handleDuplicate,
  });

  const customActions = useMemo(
    () => (
      <Button variant="default" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        {t("components.deposits-table.actions.create-token")}
      </Button>
    ),
    [t]
  );

  // Define columns inside component to access `t`
  const columns = useMemo(
    () =>
      withAutoFeatures([
        createSelectionColumn<Token>(),
        columnHelper.accessor("name", {
          header: t("components.deposits-table.columns.name"),
          meta: {
            displayName: t("components.deposits-table.columns.token-name"),
            type: "text",
            icon: Type,
            cellType: "text",
          },
        }),
        columnHelper.accessor("symbol", {
          header: t("components.deposits-table.columns.symbol"),
          meta: {
            displayName: t("components.deposits-table.columns.token-symbol"),
            type: "text",
            icon: Coins,
            cellType: "badge",
          },
        }),
        columnHelper.accessor("decimals", {
          header: t("components.deposits-table.columns.decimals"),
          meta: {
            displayName: t("components.deposits-table.columns.decimals"),
            type: "number",
            icon: Hash,
            max: 18,
            cellType: "number",
          },
        }),
        columnHelper.accessor("id", {
          header: t("components.deposits-table.columns.contract-address"),
          meta: {
            displayName: t(
              "components.deposits-table.columns.contract-address"
            ),
            type: "address",
            icon: Copy,
            cellType: "address",
          },
        }),
        columnHelper.display({
          id: "actions",
          header: t("components.deposits-table.columns.actions"),
          meta: {
            enableCsvExport: false, // Disable CSV export for actions column
          },
          cell: ({ row }) => <ActionsCell actions={createRowActions(row)} />,
        }),
      ] as ColumnDef<Token>[]),
    [t, createRowActions]
  );

  return (
    <DataTable
      name="tokens"
      data={tokens}
      columns={useCallback(() => columns, [columns])}
      urlState={{
        enabled: true,
        enableUrlPersistence: true,
        routePath,
        defaultPageSize: 20,
        enableGlobalFilter: true,
        enableRowSelection: true,
        debounceMs: 300,
      }}
      advancedToolbar={{
        enableGlobalSearch: false,
        enableFilters: true,
        enableExport: true,
        enableViewOptions: true,
        placeholder: t("components.deposits-table.search-placeholder"),
        customActions,
      }}
      bulkActions={{
        enabled: true,
        actions,
        actionGroups,
        position: "bottom",
        showSelectionCount: true,
        enableSelectAll: true,
      }}
      pagination={{
        enablePagination: true,
      }}
      initialSorting={INITIAL_SORTING}
      customEmptyState={{
        title: t("components.deposits-table.empty-state.title"),
        description: t("components.deposits-table.empty-state.description"),
        icon: Package,
      }}
    />
  );
}
