import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

/**
 * Route configuration for user claims page
 *
 * This route displays the user's identity claims and verification status:
 * - KYC claims
 * - Identity verification
 * - Document uploads
 * - Compliance status
 *
 * Route path: `/admin/user-management/{userId}/claims`
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/user-management/$userId/claims"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * User claims page component
 *
 * @todo Implement claims management:
 * - Display verified claims
 * - Pending verification status
 * - Document management
 * - Compliance checks
 * - Identity verification flow
 */
function RouteComponent() {
  const { user } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/admin/user-management/$userId",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-medium text-muted-foreground">Claims</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Claims for {user.name} will be implemented here.
        </p>
      </div>
    </div>
  );
}
