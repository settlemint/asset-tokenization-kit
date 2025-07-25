import {
  assetClassBreadcrumbs,
  createBreadcrumbMetadata,
} from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ManageDropdown } from "@/components/manage-dropdown/token";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import { seo } from "@/config/metadata";
import { getTokenTabConfiguration } from "@/lib/tokens/tab-configuration";
import {
  AssetType,
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress"
)({
  loader: async ({
    context: { queryClient, orpc },
    params: { tokenAddress, factoryAddress },
  }) => {
    const [token, factory] = await Promise.all([
      queryClient.fetchQuery(
        orpc.token.read.queryOptions({
          input: { tokenAddress },
        })
      ),
      queryClient.fetchQuery(
        orpc.token.factoryRead.queryOptions({
          input: { id: factoryAddress },
        })
      ),
    ]);

    // Build breadcrumb with available data
    const breadcrumb = [assetClassBreadcrumbs["asset-management"]];

    const assetClass = getAssetClassFromFactoryTypeId(factory.typeId);
    breadcrumb.push(
      assetClassBreadcrumbs[assetClass],
      {
        ...createBreadcrumbMetadata(factory.name),
        href: `/token/${factoryAddress}`,
      },
      createBreadcrumbMetadata(token.name)
    );

    return {
      token,
      factory,
      breadcrumb,
    };
  },
  /**
   * Head configuration for SEO
   * Uses the factory name and asset type description for metadata
   */
  head: ({ loaderData }) => {
    if (loaderData?.token) {
      const keywords = [
        loaderData.token.name,
        loaderData.token.symbol,
        "tokenization",
        "token",
      ];

      let title = loaderData.token.name;

      const assetType = getAssetTypeFromFactoryTypeId(
        loaderData.factory.typeId
      );
      title = `${loaderData.token.name} - ${loaderData.factory.name}`;
      keywords.push(assetType, loaderData.factory.name);

      return {
        meta: seo({
          title,
          keywords,
        }),
      };
    }
    return {
      meta: seo({}),
    };
  },
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
});

function RouteComponent() {
  const { token, factory } = Route.useLoaderData();
  const { factoryAddress, tokenAddress } = Route.useParams();

  // Get asset type from factory
  const assetType = getAssetTypeFromFactoryTypeId(factory.typeId);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{token.name}</h1>
            <TokenStatusBadge paused={token.pausable.paused} />
          </div>
          <ManageDropdown token={token} />
        </div>
      </div>

      <Suspense fallback={<TabNavigationSkeleton />}>
        <AsyncTabNavigation
          factoryAddress={factoryAddress as EthereumAddress}
          tokenAddress={tokenAddress as EthereumAddress}
          assetType={assetType}
        />
      </Suspense>

      <Outlet />
    </div>
  );
}

/**
 * Skeleton loader for tab navigation
 */
function TabNavigationSkeleton() {
  return (
    <div className="border-b">
      <div className="flex space-x-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}

/**
 * Async component that loads and renders tab navigation with dynamic configuration
 */
async function AsyncTabNavigation({
  factoryAddress,
  tokenAddress,
  assetType,
}: {
  factoryAddress: EthereumAddress;
  tokenAddress: EthereumAddress;
  assetType: AssetType;
}) {
  const tabs = await getTokenTabConfiguration({
    factoryAddress,
    tokenAddress,
    assetType,
  });

  return <TabNavigation items={tabs} />;
}
