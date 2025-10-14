import { AssetStatusBadge } from "@/components/assets/asset-status-badge";
import { AssetTabBadge } from "@/components/assets/asset-tab-badge";
import { getAssetTabConfiguration } from "@/components/assets/asset-tab-configuration";
import {
  assetClassBreadcrumbs,
  createBreadcrumbMetadata,
} from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ManageAssetDropdown } from "@/components/manage-dropdown/manage-asset-dropdown";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { seo } from "@atk/config/metadata";
import type { AssetExtension } from "@atk/zod/asset-extensions";
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@atk/zod/asset-types";
import type { ComplianceTypeId } from "@atk/zod/compliance";
import {
  type EthereumAddress,
  ethereumAddress,
} from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";

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
        orpc.system.factory.read.queryOptions({
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
  const { factoryAddress, tokenAddress } = Route.useParams();
  const { asset } = useTokenLoaderQuery();

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
        assetExtensions={asset.extensions}
        assetComplianceModules={asset.complianceModuleConfigs.map(
          (m) => m.complianceModule.typeId
        )}
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
  assetExtensions,
  assetComplianceModules,
}: {
  factoryAddress: EthereumAddress;
  assetAddress: EthereumAddress;
  assetComplianceModules: ComplianceTypeId[];
  assetExtensions: AssetExtension[];
}) {
  const { t } = useTranslation(["tokens", "assets", "common"]);

  // Use React Query to handle the async operation
  const { data: tabConfigs } = useQuery({
    queryKey: [
      "asset-tab-configuration",
      factoryAddress,
      assetAddress,
      assetExtensions,
      assetComplianceModules,
    ],
    queryFn: () =>
      getAssetTabConfiguration({
        factoryAddress,
        assetAddress,
        assetExtensions,
        assetComplianceModules,
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
          <AssetTabBadge badgeType={config.badgeType} />
        </>
      ) : (
        t(`tokens:tabs.${config.tabKey}`)
      ),
    }));
  }, [tabConfigs, t]);

  if (!tabConfigs) {
    return <TabNavigationSkeleton />;
  }

  return <TabNavigation items={tabs} />;
}
