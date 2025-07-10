import {
  assetClassBreadcrumbs,
  createBreadcrumbMetadata,
} from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import {
  TabNavigation,
  type TabItemProps,
} from "@/components/tab-navigation/tab-navigation";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import { seo } from "@/config/metadata";
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

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
    breadcrumb.push(assetClassBreadcrumbs[assetClass], {
      ...createBreadcrumbMetadata(factory.name),
      href: `/token/${factoryAddress}`,
    });

    breadcrumb.push(createBreadcrumbMetadata(token.name));

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
  const { token } = Route.useLoaderData();
  const { t } = useTranslation(["tokens", "assets", "common"]);
  const { factoryAddress, tokenAddress } = Route.useParams();

  const tabs = [
    {
      href: `/token/${factoryAddress}/${tokenAddress}`,
      name: t("tokens:details.tokenInformation"),
    },
    {
      href: `/token/${factoryAddress}/${tokenAddress}/holders`,
      name: t("tokens:details.holders"),
    },
    {
      href: `/token/${factoryAddress}/${tokenAddress}/events`,
      name: t("tokens:details.events"),
    },
  ] as TabItemProps[];

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{token.name}</h1>
          <TokenStatusBadge paused={token.pausable.paused} />
        </div>
      </div>

      <TabNavigation items={tabs} />

      <Outlet />
    </div>
  );
}
