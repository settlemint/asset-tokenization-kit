import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { BasicInfoTile } from "@/components/participants/users/tiles/basic-info-tile";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

/**
 * Route configuration for the user details index page
 *
 * This route displays the default view for a specific user's details page.
 * It inherits the user data from its parent route and displays the main
 * user information in detail grids.
 *
 * Route path: `/participants/users/{userId}/`
 *
 * @remarks
 * - This is a child route that inherits data from the parent $userId route
 * - User data is already loaded by the parent route loader
 * - Shows the Details tab content with basic and identity information
 * - Parent route handles layout, breadcrumbs, and tab navigation
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/users/$userId/"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * User details index page component
 *
 * Displays detailed user information in structured grids.
 * Gets user data from the parent route's loader data.
 * Layout and navigation are handled by parent route.
 */
function RouteComponent() {
  // Get data from parent route loader
  const { user: loaderUser } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/participants/users/$userId",
  });
  const { orpc } = Route.useRouteContext();
  const { userId } = Route.useParams();
  const { data: queriedUser } = useQuery(
    orpc.user.read.queryOptions({
      input: { userId },
    })
  );

  const user = queriedUser ?? loaderUser;
  const displayName = getUserDisplayName(user);

  return (
    <>
      <BasicInfoTile user={user} displayName={displayName} />
    </>
  );
}
