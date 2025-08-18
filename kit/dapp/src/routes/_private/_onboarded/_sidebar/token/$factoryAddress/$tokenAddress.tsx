import {
  type AssetType,
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@atk/zod/validators/asset-types";
import {
  type EthereumAddress,
  ethereumAddress,
} from "@atk/zod/validators/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { AssetStatusBadge } from "@/components/assets/asset-status-badge";
import { TabBadge } from "@/components/assets/tab-badge";
import {
  assetClassBreadcrumbs,
  createBreadcrumbMetadata,
} from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ManageAssetDropdown } from "@/components/manage-dropdown/manage-asset-dropdown";
import { getAssetTabConfiguration } from "@/components/tab-navigation/asset-tab-configuration";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { seo } from "@/config/metadata";
import { orpc } from "@/orpc/orpc-client";

const routeParamsSchema = z.object({
  factoryAddress: ethereumAddress,
  tokenAddress: ethereumAddress,
});

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
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
        orpc.system.tokenFactoryRead.queryOptions({
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
  const { asset: loaderAsset, factory } = Route.useLoaderData();
  const { factoryAddress, tokenAddress } = Route.useParams();

  // Get asset type from factory
  const assetType = getAssetTypeFromFactoryTypeId(factory.typeId);

  // Subscribe to live asset so UI reacts to invalidations from actions
  const { data: queriedAsset } = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress },
    })
  );

  const asset = queriedAsset ?? loaderAsset;

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

      <AsyncTabNavigation
        factoryAddress={factoryAddress}
        assetAddress={tokenAddress}
        assetType={assetType}
      />

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
 * Component that loads and renders tab navigation with dynamic configuration
 */
function AsyncTabNavigation({
  factoryAddress,
  assetAddress,
  assetType,
}: {
  factoryAddress: EthereumAddress;
  assetAddress: EthereumAddress;
  assetType: AssetType;
}) {
  const { t } = useTranslation(["tokens", "assets", "common"]);

  // Use React Query to handle the async operation
  const { data: tabConfigs } = useQuery({
    queryKey: [
      "asset-tab-configuration",
      factoryAddress,
      assetAddress,
      assetType,
    ],
    queryFn: () =>
      getAssetTabConfiguration({
        factoryAddress,
        assetAddress,
        assetType,
      }),
  });

  // Transform tab configurations to TabItemProps with translations and badges
  const tabs = useMemo(() => {
    if (!tabConfigs) return [];

    return tabConfigs.map((config) => ({
      href: config.href,
      name: config.badgeType ? (
        <>
          {t(`tokens:tabs.${config.tabKey}`)}
          <TabBadge
            address={assetAddress}
            assetType={assetType}
            badgeType={config.badgeType}
          />
        </>
      ) : (
        t(`tokens:tabs.${config.tabKey}`)
      ),
    }));
  }, [tabConfigs, t, assetAddress, assetType]);

  if (!tabConfigs) {
    return <TabNavigationSkeleton />;
  }

  return <TabNavigation items={tabs} />;
}
