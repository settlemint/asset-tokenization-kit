import { DataTableErrorBoundary } from "@/components/data-table/data-table-error-boundary";
import { createDataTableSearchParams } from "@/components/data-table/utils/data-table-url-state";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TokenFactoryRelated } from "@/components/related/token-factory-related";
import { TokensTable } from "@/components/tables/tokens";
import { TokenFactoryTopInfo } from "@/components/top-info/token-factory-top-info";
import { seo } from "@/config/metadata";
import { getAssetTypeFromFactoryTypeId } from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc";
import { createFileRoute } from "@tanstack/react-router";

/**
 * Route configuration for the token factory details page
 *
 * This route displays detailed information about a specific token factory
 * and lists all tokens (deposits) created by that factory. The route is
 * authenticated and requires the user to be onboarded.
 *
 * Route path: `/token/{factoryAddress}`
 *
 * @remarks
 * - The factoryAddress parameter must be a valid Ethereum address
 * - Search parameters are validated to support data table state persistence
 * - Factory data is cached using TanStack Query for optimal performance
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/token/$factoryAddress',
 *   params: { factoryAddress: '0x1234...' }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/token/$factoryAddress/"
)({
  /**
   * Validates search parameters for data table state
   * Enables URL-based persistence of table filters, sorting, and pagination
   * with a default page size of 20 items
   */
  validateSearch: createDataTableSearchParams({ defaultPageSize: 20 }),

  /**
   * Route loader function that prefetches required data
   *
   * @param context - Route context containing the query client
   * @param params - Route parameters containing the factory address
   * @returns Object containing the factory details
   * @throws If the factory is not found or the user lacks permissions
   */
  loader: async ({ context, params }) => {
    // Ensure factory data is loaded
    const factory = await context.queryClient.ensureQueryData(
      orpc.token.factoryRead.queryOptions({
        input: { id: params.factoryAddress },
      })
    );

    // Prefetch tokens list for better UX
    void context.queryClient.prefetchQuery(
      orpc.token.list.queryOptions({
        input: {
          tokenFactory: params.factoryAddress,
        },
      })
    );

    return { factory };
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
          title: loaderData.factory.name,
          keywords: [
            assetType,
            "tokenization",
            "factory",
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
 * Token factory details page component
 *
 * Displays the factory name and a table of all tokens (deposits) created
 * by this factory. The table supports filtering, sorting, and pagination
 * with state persisted in the URL.
 *
 * @remarks
 * - Uses the DepositsTable component which handles token listing
 * - Factory data is guaranteed to be available from the loader
 * - Table state (filters, sorting, pagination) is persisted in URL
 *
 * @example
 * ```tsx
 * // The component receives factory data from the loader
 * // and displays it with a deposits table
 * <RouteComponent />
 * // Renders:
 * // - Factory name as page title
 * // - DepositsTable showing all tokens from this factory
 * ```
 */
function RouteComponent() {
  const { factory } = Route.useLoaderData();
  const { factoryAddress } = Route.useParams();

  // Get the asset type from the factory typeId
  const assetType = getAssetTypeFromFactoryTypeId(factory.typeId);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{factory.name}</h1>
      </div>

      <TokenFactoryTopInfo assetType={assetType} />

      <DataTableErrorBoundary tableName="Tokens">
        <TokensTable factoryAddress={factoryAddress} />
      </DataTableErrorBoundary>

      <TokenFactoryRelated assetType={assetType} />
    </div>
  );
}
