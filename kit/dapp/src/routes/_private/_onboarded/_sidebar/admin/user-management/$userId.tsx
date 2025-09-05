import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { createFileRoute, Outlet } from "@tanstack/react-router";
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
 * Route path: `/admin/user-management/{userId}`
 *
 * @remarks
 * - The userId parameter must be a non-empty string
 * - User data is fetched using ORPC and cached with TanStack Query
 * - This is a parent route that renders child routes via Outlet
 * - Requires appropriate permissions to view user data
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/admin/user-management/$userId',
 *   params: { userId: 'user-123' }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/user-management/$userId"
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
    return {
      user,
      breadcrumb: [
        createI18nBreadcrumbMetadata("userManagement"),
        { title: user.name, href: `/admin/user-management/${userId}` },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Parent route component that renders child routes
 *
 * This component provides the shared layout for all user detail pages
 * and renders child routes through the Outlet component.
 */
function RouteComponent() {
  return <Outlet />;
}