import { AssetStatusBadge } from "@/components/assets/asset-status-badge";
import {
  assetClassBreadcrumbs,
  createBreadcrumbMetadata,
} from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ManageAssetDropdown } from "@/components/manage-dropdown/asset";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { seo } from "@/config/metadata";
import {
  AssetType,
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { getAssetTabConfiguration } from "./$tokenAddress/tab-configuration";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress"
)({
  loader: async ({
    context: { queryClient, orpc },
    params: { tokenAddress, factoryAddress },
  }) => {
    const [asset, factory] = await Promise.all([
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
      createBreadcrumbMetadata(asset.name)
    );

    return {
      asset,
      factory,
      breadcrumb,
    };
  },
  /**
   * Head configuration for SEO
   * Uses the factory name and asset type description for metadata
   */
  head: ({ loaderData }) => {
    if (loaderData?.asset) {
      const keywords = [
        loaderData.asset.name,
        loaderData.asset.symbol,
        "asset tokenization",
        "digital asset",
      ];

      let title = loaderData.asset.name;

      const assetType = getAssetTypeFromFactoryTypeId(
        loaderData.factory.typeId
      );
      title = `${loaderData.asset.name} - ${loaderData.factory.name}`;
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
  const { asset, factory } = Route.useLoaderData();
  const { factoryAddress, tokenAddress } = Route.useParams();

  // Get asset type from factory
  const assetType = getAssetTypeFromFactoryTypeId(factory.typeId);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
            <AssetStatusBadge paused={asset.pausable.paused} />
          </div>
          <ManageAssetDropdown asset={asset} />
        </div>
      </div>

      <Suspense fallback={<TabNavigationSkeleton />}>
        <AsyncTabNavigation
          factoryAddress={factoryAddress as EthereumAddress}
          assetAddress={tokenAddress as EthereumAddress}
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
  assetAddress,
  assetType,
}: {
  factoryAddress: EthereumAddress;
  assetAddress: EthereumAddress;
  assetType: AssetType;
}) {
  const tabs = await getAssetTabConfiguration({
    factoryAddress,
    assetAddress,
    assetType,
  });

  return <TabNavigation items={tabs} />;
}
