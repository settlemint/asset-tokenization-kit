import {
  assetClassBreadcrumbs,
  createBreadcrumbMetadata,
} from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import {
  DetailGrid,
  DetailGridErrorBoundary,
  DetailGridItem,
} from "@/components/detail-grid";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
import { seo } from "@/config/metadata";
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Route configuration for individual token details page
 *
 * This route displays detailed information about a specific token
 * created by a token factory. The route is authenticated and requires
 * the user to be onboarded.
 *
 * Route path: `/token/{factoryAddress}/{tokenAddress}`
 *
 * @remarks
 * - Both factoryAddress and tokenAddress must be valid Ethereum addresses
 * - This route is nested under the factory route for hierarchical navigation
 * - Currently displays a placeholder - implementation pending
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/token/$factoryAddress/$tokenAddress',
 *   params: {
 *     factoryAddress: '0x1234...',
 *     tokenAddress: '0x5678...'
 *   }
 * });
 * ```
 *
 * @todo Implement the following features:
 * - Load token details from the API
 * - Display token metadata (name, symbol, supply, etc.)
 * - Show user permissions and roles for this token
 * - Add token operations (transfer, mint, burn) based on permissions
 * - Include transaction history
 * - Display compliance and regulatory information
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress"
)({
  /**
   * Route loader function that prefetches required data
   *
   * @param context - Route context containing the query client
   * @param params - Route parameters containing the factory address
   * @returns Object containing the factory details
   * @throws If the token is not found or the user lacks permissions
   */
  loader: async ({
    context: { queryClient, orpc },
    params: { factoryAddress, tokenAddress },
  }) => {
    // Use Promise.allSettled to handle partial failures gracefully
    const [tokenResult, factoryResult] = await Promise.allSettled([
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

    // Token is required - throw if it fails
    if (tokenResult.status === "rejected") {
      throw new Error(
        `Failed to load token details: ${tokenResult.reason?.message ?? "Unknown error"}`
      );
    }

    const token = tokenResult.value;

    // Factory is optional - we can still show token details without it
    const factory =
      factoryResult.status === "fulfilled" ? factoryResult.value : null;

    // Build breadcrumb with available data
    const breadcrumb = [assetClassBreadcrumbs["asset-management"]];

    if (factory) {
      const assetClass = getAssetClassFromFactoryTypeId(factory.typeId);
      breadcrumb.push(assetClassBreadcrumbs[assetClass], {
        ...createBreadcrumbMetadata(factory.name),
        href: `/token/${factoryAddress}`,
      });
    }

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

      if (loaderData.factory) {
        const assetType = getAssetTypeFromFactoryTypeId(
          loaderData.factory.typeId
        );
        title = `${loaderData.token.name} - ${loaderData.factory.name}`;
        keywords.push(assetType, loaderData.factory.name);
      }

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
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Token details page component (placeholder)
 *
 * Currently displays a placeholder message. This component will be
 * expanded to show comprehensive token information including:
 * - Token metadata and configuration
 * - User permissions and available operations
 * - Transaction history and holders
 * - Compliance and regulatory status
 *
 * @returns Placeholder component for token details page
 *
 * @todo Replace placeholder with actual implementation:
 * ```tsx
 * function RouteComponent() {
 *   const { factoryAddress, tokenAddress } = Route.useParams();
 *   const { data: token } = useQuery(
 *     orpc.token.read.queryOptions({
 *       input: { id: tokenAddress }
 *     })
 *   );
 *
 *   return (
 *     <div className="space-y-6 p-6">
 *       <TokenHeader token={token} />
 *       <TokenMetrics token={token} />
 *       <TokenOperations token={token} />
 *       <TokenTransactionHistory tokenAddress={tokenAddress} />
 *     </div>
 *   );
 * }
 * ```
 */
function RouteComponent() {
  const { token, factory } = Route.useLoaderData();
  const { t } = useTranslation(["tokens", "assets", "common"]);

  // Get asset type for display (if factory is available)
  const assetType = factory
    ? getAssetTypeFromFactoryTypeId(factory.typeId)
    : null;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{token.name}</h1>
          <Badge variant="secondary" className="font-mono">
            {token.symbol}
          </Badge>
          <TokenStatusBadge paused={token.pausable.paused} />
        </div>
      </div>

      {/* Token Information */}
      <DetailGridErrorBoundary gridTitle={t("tokens:details.tokenInformation")}>
        <DetailGrid title={t("tokens:details.tokenInformation")}>
          <DetailGridItem
            label={t("tokens:fields.contractAddress")}
            info={t("tokens:fields.contractAddressInfo")}
          >
            <Web3Address
              address={token.id}
              copyToClipboard={true}
              showFullAddress={false}
              size="tiny"
              showSymbol={false}
              showBadge={false}
              showPrettyName={false}
            />
          </DetailGridItem>

          <DetailGridItem
            label={t("tokens:fields.name")}
            info={t("tokens:fields.nameInfo")}
          >
            {token.name}
          </DetailGridItem>

          <DetailGridItem
            label={t("tokens:fields.symbol")}
            info={t("tokens:fields.symbolInfo")}
          >
            <Badge variant="secondary" className="font-mono">
              {token.symbol}
            </Badge>
          </DetailGridItem>

          <DetailGridItem
            label={t("tokens:fields.decimals")}
            info={t("tokens:fields.decimalsInfo")}
          >
            {token.decimals}
          </DetailGridItem>

          <DetailGridItem
            label={t("tokens:fields.totalSupply")}
            info={t("tokens:fields.totalSupplyInfo")}
          >
            <span className="font-mono">
              {token.totalSupply.toLocaleString()}
            </span>
          </DetailGridItem>

          {assetType && (
            <DetailGridItem
              label={t("tokens:fields.assetType")}
              info={t("tokens:fields.assetTypeInfo")}
            >
              <Badge>{t(`tokens:asset-types.${assetType}` as const)}</Badge>
            </DetailGridItem>
          )}
        </DetailGrid>
      </DetailGridErrorBoundary>

      {/* Compliance Information */}
      <DetailGridErrorBoundary
        gridTitle={t("tokens:details.complianceInformation")}
      >
        <DetailGrid title={t("tokens:details.complianceInformation")}>
          <DetailGridItem
            label={t("tokens:fields.requiredClaims")}
            info={t("tokens:fields.requiredClaimsInfo")}
          >
            <span className="text-muted-foreground">
              {t("tokens:fields.noRequiredClaims")}
            </span>
          </DetailGridItem>
        </DetailGrid>
      </DetailGridErrorBoundary>
    </div>
  );
}
