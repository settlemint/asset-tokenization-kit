import { createSelectionColumn } from "@/components/data-table/columns/selection-column";
import { DataTable } from "@/components/data-table/data-table";
import { useBulkActions } from "@/components/data-table/data-table-bulk-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orpc } from "@/orpc";
import type { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Hash,
  MoreHorizontal,
  Package,
  Plus,
  Type,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { createDataTableSearchParams } from "@/components/data-table/utils/data-table-url-state";
import { numberFilterFn } from "@/components/data-table/filters/functions/number-filter";
import { textFilterFn } from "@/components/data-table/filters/functions/text-filter";
import type { Row } from "@tanstack/react-table";
import type { FilterValue } from "@/components/data-table/filters/types/filter-types";

// Wrapper to handle both simple values from URL and complex filter objects
function flexibleNumberFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string | number | FilterValue<"number", TData>
) {
  // If it's a simple value (from URL), convert to complex structure
  if (typeof filterValue === "string" || typeof filterValue === "number") {
    const numValue =
      typeof filterValue === "string" ? Number(filterValue) : filterValue;
    if (isNaN(numValue)) return true; // If not a valid number, show all

    return numberFilterFn(row, columnId, {
      operator: "is",
      values: [numValue],
      columnMeta: undefined, // Will be populated by the filter function if needed
    });
  }

  // Otherwise it's already a complex filter object
  return numberFilterFn(row, columnId, filterValue);
}

// Similar wrapper for text filters
function flexibleTextFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string | FilterValue<"text", TData>
) {
  // If it's a simple value (from URL), convert to complex structure
  if (typeof filterValue === "string") {
    return textFilterFn(row, columnId, {
      operator: "contains",
      values: [filterValue],
      columnMeta: undefined, // Will be populated by the filter function if needed
    });
  }

  // Otherwise it's already a complex filter object
  return textFilterFn(row, columnId, filterValue);
}

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

// Cell renderer components to avoid inline functions
const AddressCellRenderer = ({
  address,
  onCopy,
}: {
  address: string;
  onCopy: (address: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onCopy(address);
  }, [address, onCopy]);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-muted-foreground">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleClick}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};

const ActionsCellRenderer = ({
  row,
  factoryAddress,
  onDropdownAction,
}: {
  row: { original: Token };
  factoryAddress: string;
  onDropdownAction: (action: string, tokenId: string) => void;
}) => {
  const handleCopyClick = useCallback(() => {
    onDropdownAction("copy", row.original.id);
  }, [row.original.id, onDropdownAction]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            to="/token/$factoryAddress/$tokenAddress"
            params={{
              factoryAddress,
              tokenAddress: row.original.id,
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyClick}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href={`https://etherscan.io/token/${row.original.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Etherscan
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const createTokenColumns = (params: {
  factoryAddress: string;
  onCopyAddress: (address: string) => void;
  onDropdownAction: (action: string, tokenId: string) => void;
}) => {
  const { factoryAddress, onCopyAddress, onDropdownAction } = params;
  return [
    createSelectionColumn<Token>(),
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
      filterFn: flexibleTextFilterFn,
      meta: {
        displayName: "Token Name",
        type: "text",
        icon: Type,
        enableCsvExport: true,
      },
    }),
    columnHelper.accessor("symbol", {
      header: "Symbol",
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="font-mono">
          {getValue()}
        </Badge>
      ),
      filterFn: flexibleTextFilterFn,
      meta: {
        displayName: "Token Symbol",
        type: "text",
        icon: Coins,
        enableCsvExport: true,
      },
    }),
    columnHelper.accessor("decimals", {
      header: "Decimals",
      cell: ({ getValue }) => (
        <span className="font-mono text-muted-foreground">{getValue()}</span>
      ),
      filterFn: flexibleNumberFilterFn,
      meta: {
        displayName: "Decimals",
        type: "number",
        icon: Hash,
        max: 18,
        enableCsvExport: true,
      },
    }),
    columnHelper.accessor("id", {
      header: "Contract Address",
      cell: ({ getValue }) => (
        <AddressCellRenderer address={getValue()} onCopy={onCopyAddress} />
      ),
      filterFn: flexibleTextFilterFn,
      meta: {
        displayName: "Contract Address",
        type: "text",
        icon: Copy,
        enableCsvExport: true,
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsCellRenderer
          row={row}
          factoryAddress={factoryAddress}
          onDropdownAction={onDropdownAction}
        />
      ),
    }),
  ];
};

function RouteComponent() {
  const { factory } = Route.useLoaderData();
  const { factoryAddress } = Route.useParams();

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

  const onCopyAddress = useCallback((address: string) => {
    void navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  }, []);

  const onDropdownAction = useCallback((action: string, tokenId: string) => {
    if (action === "copy") {
      void navigator.clipboard.writeText(tokenId);
      toast.success("Token address copied to clipboard");
    }
  }, []);

  const columns = useMemo(
    () =>
      createTokenColumns({ factoryAddress, onCopyAddress, onDropdownAction }),
    [factoryAddress, onCopyAddress, onDropdownAction]
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
