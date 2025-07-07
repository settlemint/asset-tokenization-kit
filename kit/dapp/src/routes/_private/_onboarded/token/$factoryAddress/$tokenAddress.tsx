import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import {
  assetClassBreadcrumbs,
  createBreadcrumbMetadata,
} from "@/components/breadcrumb/metadata";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { seo } from "@/config/metadata";
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { createFileRoute } from "@tanstack/react-router";

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
  "/_private/_onboarded/token/$factoryAddress/$tokenAddress"
)({
  /**
   * Route loader function that prefetches required data
   *
   * @param context - Route context containing the query client
   * @param params - Route parameters containing the factory address
   * @returns Object containing the factory details
   * @throws If the factory is not found or the user lacks permissions
   */
  loader: async ({
    context: { queryClient, orpc },
    params: { factoryAddress, tokenAddress },
  }) => {
    const [token, factory] = await Promise.all([
      queryClient.ensureQueryData(
        orpc.token.read.queryOptions({
          input: { id: tokenAddress },
        })
      ),
      queryClient.ensureQueryData(
        orpc.token.factoryRead.queryOptions({
          input: { id: factoryAddress },
        })
      ),
    ]);

    // Get asset class for breadcrumb
    const assetClass = getAssetClassFromFactoryTypeId(factory.typeId);

    return {
      token,
      factory,
      breadcrumb: [
        { ...assetClassBreadcrumbs["asset-management"], href: "/" },
        { ...assetClassBreadcrumbs[assetClass], href: "/" },
        { ...createBreadcrumbMetadata(factory.name), href: `/token/${factoryAddress}` },
        createBreadcrumbMetadata(token.name),
      ],
    };
  },
  /**
   * Head configuration for SEO
   * Uses the factory name and asset type description for metadata
   */
  head: ({ loaderData }) => {
    if (loaderData) {
      const assetType = getAssetTypeFromFactoryTypeId(
        loaderData.factory.typeId
      );

      return {
        meta: seo({
          title: `${loaderData.token.name} - ${loaderData.factory.name}`,
          keywords: [
            loaderData.token.name,
            loaderData.token.symbol,
            assetType,
            "tokenization",
            "token",
            loaderData.factory.name,
          ],
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
  const { token } = Route.useLoaderData();

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <h1 className="text-3xl font-bold tracking-tight">{token.name}</h1>
      </div>
    </div>
  );
}
