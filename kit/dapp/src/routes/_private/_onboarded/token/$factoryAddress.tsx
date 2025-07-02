import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc";
import type { TokenList } from "@/orpc/routes/token/routes/token.list.schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { ExternalLink, Eye, Package } from "lucide-react";

export const Route = createFileRoute(
  "/_private/_onboarded/token/$factoryAddress"
)({
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

const createTokenColumns = (params: { factoryAddress: string }) => {
  const { factoryAddress } = params;
  return [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),
    columnHelper.accessor("symbol", {
      header: "Symbol",
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="font-mono">
          {getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("decimals", {
      header: "Decimals",
      cell: ({ getValue }) => (
        <span className="font-mono text-muted-foreground">{getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link
              to="/token/$factoryAddress/$tokenAddress"
              params={{
                factoryAddress,
                tokenAddress: row.original.id,
              }}
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a
              href={`https://etherscan.io/token/${row.original.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Etherscan
            </a>
          </Button>
        </div>
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
          columnParams={{ factoryAddress }}
          columns={createTokenColumns}
          urlState={{
            enabled: true,
            routePath: "/_private/_onboarded/token/$factoryAddress",
            defaultPageSize: 10,
          }}
          toolbar={{}}
          pagination={{}}
          customEmptyState={{
            title: "No tokens found",
            description: "This factory has not created any tokens yet.",
            icon: Package,
          }}
        />
      </div>
    </div>
  );
}
