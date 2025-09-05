import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { UserDetailPage } from "@/components/users/user-detail-page";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

/**
 * Route configuration for the user details index page
 *
 * This route displays the default view for a specific user's details page.
 * It inherits the user data from its parent route and displays the main
 * user information in a tabbed interface.
 *
 * Route path: `/admin/user-management/{userId}/`
 *
 * @remarks
 * - This is a child route that inherits data from the parent $userId route
 * - User data is already loaded by the parent route loader
 * - Currently shows the Details tab with basic and identity information
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/user-management/$userId/"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * User details index page component
 *
 * Displays detailed information about a specific user with tabs interface.
 * Gets user data from the parent route's loader data.
 */
function RouteComponent() {
  // Get data from parent route loader
  const { user } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/admin/user-management/$userId",
  });

  return (
    <div className="container mx-auto p-6">
      <RouterBreadcrumb />
      <UserDetailPage user={user} />
    </div>
  );
}