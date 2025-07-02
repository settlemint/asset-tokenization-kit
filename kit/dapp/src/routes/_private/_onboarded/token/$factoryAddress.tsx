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
import { createFileRoute, useRouter } from "@tanstack/react-router";
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
import { toast } from "sonner";
import "@/components/data-table/filters/types/table-extensions";

import { createDataTableSearchParams } from "@/components/data-table/utils/data-table-url-state";

export const Route = createFileRoute(
  "/_private/_onboarded/token/$factoryAddress"
)({
  validateSearch: createDataTableSearchParams({ defaultPageSize: 20 }),
  loader: async ({ context, params }) => {
    // Ensure factory data is loaded
    const factory = await context.queryClient.ensureQueryData(
      orpc.token.factoryRead.queryOptions({
        input: { id: params.factoryAddress },
      })
    );

    void context.queryClient.prefetchQuery(
      orpc.token.list.queryOptions({
        input: {
          tokenFactory: params.factoryAddress,
        },
      })
    );

    return { factory };
  },
  component: RouteComponent,
});

type Token = TokenList[number];

const columnHelper = createColumnHelper<Token>();

// Constants to avoid inline array creation
const INITIAL_SORTING = [
  {
    id: "name",
    desc: false,
  },
];

// Factory function for row actions
const createRowActions = (
  row: { original: Token },
  factoryAddress: string,
  router: ReturnType<typeof useRouter>,
  toast: { success: (message: string) => void }
): ActionItem[] => [
  {
    label: "View Details",
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
    label: "Copy Address",
    icon: <Copy className="h-4 w-4" />,
    onClick: () => {
      void navigator.clipboard.writeText(row.original.id);
      toast.success("Token address copied to clipboard");
    },
  },
  {
    label: "View on Etherscan",
    icon: <ExternalLink className="h-4 w-4" />,
    href: `https://etherscan.io/token/${row.original.id}`,
    separator: "before",
  },
];

const createTokenColumns = (params: {
  factoryAddress: string;
  router: ReturnType<typeof useRouter>;
}): ColumnDef<Token>[] => {
  const { factoryAddress, router } = params;

  return withAutoFeatures([
    createSelectionColumn<Token>(),
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
      meta: {
        displayName: "Token Name",
        type: "text",
        icon: Type,
        cellType: "text",
        cellProps: { className: "font-medium" },
      },
    }),
    columnHelper.accessor("symbol", {
      header: "Symbol",
      meta: {
        displayName: "Token Symbol",
        type: "text",
        icon: Coins,
        cellType: "badge",
        cellProps: { variant: "secondary", className: "font-mono" },
      },
    }),
    columnHelper.accessor("decimals", {
      header: "Decimals",
      meta: {
        displayName: "Decimals",
        type: "number",
        icon: Hash,
        max: 18,
        cellType: "number",
        cellProps: { precision: 0 },
      },
    }),
    columnHelper.accessor("id", {
      header: "Contract Address",
      meta: {
        displayName: "Contract Address",
        type: "address",
        icon: Copy,
        cellType: "address",
        cellProps: { showCopyButton: true, truncateLength: 6 },
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      meta: {
        enableCsvExport: false, // Disable CSV export for actions column
      },
      cell: ({ row }) => (
        <ActionsCell
          actions={createRowActions(row, factoryAddress, router, toast)}
        />
      ),
    }),
  ] as ColumnDef<Token>[]);
};

function RouteComponent() {
  const { factory } = Route.useLoaderData();
  const { factoryAddress } = Route.useParams();
  const router = useRouter();

  const { data: tokensResponse } = useQuery({
    ...orpc.token.list.queryOptions({
      input: {
        tokenFactory: factory.id,
      },
    }),
  });

  const tokens = tokensResponse ?? [];

  const handleArchive = useCallback((selectedTokens: Token[]) => {
    toast.info(
      `Would archive ${selectedTokens.length} token(s). This is a demo action.`
    );
  }, []);

  const handleDuplicate = useCallback((selectedTokens: Token[]) => {
    toast.info(
      `Would duplicate ${selectedTokens.length} token(s). This is a demo action.`
    );
  }, []);

  const { actions, actionGroups } = useBulkActions<Token>({
    onArchive: handleArchive,
    onDuplicate: handleDuplicate,
  });

  const customActions = useMemo(
    () => (
      <Button variant="default" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Create Token
      </Button>
    ),
    []
  );

  const columns = useMemo(
    () => createTokenColumns({ factoryAddress, router }),
    [factoryAddress, router]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Token Factory</h1>
        <div className="flex flex-col gap-1 text-muted-foreground">
          <p>Factory: {factory.name}</p>
          <p className="font-mono text-sm">{factory.id}</p>
          <p>Type: {factory.typeId}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tokens ({tokens.length})</h2>
        </div>

        <DataTable
          name="tokens"
          data={tokens}
          columns={useCallback(() => columns, [columns])}
          urlState={{
            enabled: true,
            enableUrlPersistence: true,
            routePath: "/_private/_onboarded/token/$factoryAddress",
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
            placeholder: "Search tokens by name, symbol, or address...",
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
            title: "No tokens found",
            description:
              "This factory has not created any tokens yet. Create your first token to get started.",
            icon: Package,
          }}
        />
      </div>
    </div>
  );
}
