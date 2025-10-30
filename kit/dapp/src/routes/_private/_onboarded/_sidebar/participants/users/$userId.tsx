import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { getUserTabConfiguration } from "@/components/tab-navigation/user-tab-configuration";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const routeParamsSchema = z.object({
  userId: z.string().min(1),
});

/**
 * Route configuration for the user details page parent route
 *
 * This route handles the userId parameter and provides shared data loading
 * for all user detail sub-routes. The route is authenticated and requires
 * the user to be onboarded.
 *
 * Route path: `/participants/users/{userId}`
 *
 * @remarks
 * - The userId parameter must be a non-empty string
 * - User data is fetched using ORPC and cached with TanStack Query
 * - This is a parent route that provides shared layout and tab navigation
 * - Requires appropriate permissions to view user data
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/participants/users/$userId',
 *   params: { userId: 'user-123' }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/users/$userId"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  /**
   * Loader function to prepare user data
   * Fetches user information using the ORPC user.read endpoint
   */
  loader: async ({ params: { userId }, context: { queryClient, orpc } }) => {
    const user = await queryClient.ensureQueryData(
      orpc.user.read.queryOptions({ input: { userId } })
    );
    const identity = await queryClient
      .ensureQueryData(
        orpc.system.identity.read.queryOptions({
          input: { wallet: user.wallet ?? "" },
        })
      )
      .catch((error: unknown) => {
        if (error instanceof ORPCError && error.status === 404) {
          return undefined;
        }
        throw error;
      });
    return {
      user,
      identity,
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsUsers", {
          href: `/participants/users`,
        }),
        { title: user.name, href: `/participants/users/${userId}` },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Parent route component with shared layout and tab navigation
 *
 * This component provides the shared layout for all user detail pages
 * including header, breadcrumbs, tabs, and renders child routes through Outlet.
 */
function RouteComponent() {
  const { user: loaderUser } = Route.useLoaderData();
  const { userId } = Route.useParams();
  const { t } = useTranslation(["user", "common"]);

  // Subscribe to live user data so UI reacts to updates
  const { data: queriedUser } = useQuery(
    Route.useRouteContext().orpc.user.read.queryOptions({
      input: { userId },
    })
  );

  const user = queriedUser ?? loaderUser;
  const displayName = getUserDisplayName(user);

  // Generate tab configuration based on user data
  // Only memoize based on properties that affect tab configuration
  const tabConfigs = useMemo(
    () => getUserTabConfiguration({ userId }),
    [userId]
  );

  // Transform tab configurations to TabItemProps with translations
  const tabs = useMemo(() => {
    return tabConfigs.map((config) => ({
      href: config.href,
      name: t(`user:tabs.${config.tabKey}`),
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
              {displayName || user.email}
            </h1>
          </div>
          {/* Future: Add ManageUserDropdown here */}
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation items={tabs} />

      {/* Child Routes */}
      <Outlet />
    </div>
  );
}
