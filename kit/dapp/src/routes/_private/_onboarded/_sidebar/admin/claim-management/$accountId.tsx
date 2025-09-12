import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { getClaimTabConfiguration } from "@/components/tab-navigation/claim-tab-configuration";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const routeParamsSchema = z.object({
  accountId: z.string().min(1),
});

/**
 * Route configuration for the claim details page parent route
 *
 * This route handles the accountId parameter and provides shared data loading
 * for all claim detail sub-routes. The route is authenticated and requires
 * the user to be onboarded.
 *
 * Route path: `/admin/claim-management/{accountId}`
 *
 * @remarks
 * - The accountId parameter must be a non-empty string (wallet address)
 * - Claim data is fetched using ORPC and cached with TanStack Query
 * - This is a parent route that provides shared layout and tab navigation
 * - Requires appropriate permissions to view claim data
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/admin/claim-management/$accountId',
 *   params: { accountId: '0x1234567890123456789012345678901234567890' }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/claim-management/$accountId"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  /**
   * Loader function to prepare claim data
   * Fetches claim information using the ORPC system.identity.claims.list endpoint
   */
  loader: async ({ params: { accountId }, context: { queryClient, orpc } }) => {
    const claimsData = await queryClient.ensureQueryData(
      orpc.system.identity.claims.list.queryOptions({ input: { accountId } })
    );
    return {
      claimsData,
      breadcrumb: [
        createI18nBreadcrumbMetadata("claimManagement"),
        {
          title: `${accountId.slice(0, 6)}...${accountId.slice(-4)}`,
          href: `/admin/claim-management/${accountId}`,
        },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Parent route component with shared layout and tab navigation
 *
 * This component provides the shared layout for all claim detail pages
 * including header, breadcrumbs, tabs, and renders child routes through Outlet.
 */
function RouteComponent() {
  const { claimsData: loaderClaimsData } = Route.useLoaderData();
  const { accountId } = Route.useParams();
  const { t } = useTranslation(["claims", "common"]);

  // Subscribe to live claims data so UI reacts to updates
  const { data: queriedClaimsData } = useQuery(
    Route.useRouteContext().orpc.system.identity.claims.list.queryOptions({
      input: { accountId },
    })
  );

  const claimsData = queriedClaimsData ?? loaderClaimsData;

  const displayAddress = `${accountId.slice(0, 6)}...${accountId.slice(-4)}`;

  // Generate tab configuration based on claims data
  // Only memoize based on properties that affect tab configuration
  const tabConfigs = useMemo(
    () => getClaimTabConfiguration({ accountId }),
    [accountId]
  );

  // Transform tab configurations to TabItemProps with translations
  const tabs = useMemo(() => {
    type ClaimTabKey = "details";
    type ClaimTabConfig = { href: string; tabKey: ClaimTabKey };
    return (tabConfigs as ClaimTabConfig[]).map((config) => ({
      href: config.href,
      name: t(`claims:tabs.${config.tabKey}`),
    }));
  }, [tabConfigs, t]);

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              {displayAddress}
            </h1>
            <ClaimStatusBadge claimsData={claimsData} />
          </div>
          {/* Future: Add ManageClaimDropdown here */}
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation items={tabs} />

      {/* Child Routes */}
      <Outlet />
    </div>
  );
}
