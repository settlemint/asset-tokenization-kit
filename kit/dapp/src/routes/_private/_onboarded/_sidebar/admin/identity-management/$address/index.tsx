import { createFileRoute } from "@tanstack/react-router";

/**
 * Default identity detail page that shows comprehensive identity information
 *
 * This is the default tab/view when viewing a specific identity address.
 * It displays all identity data, claims information, and verification status
 * for the specified address.
 *
 * Route path: `/admin/identity-management/{address}`
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/identity-management/$address/"
)({
  component: IdentityDetailPage,
});

function IdentityDetailPage() {
  return (
    <div className="space-y-6">
      <p>Under construction - Identity Detail Page</p>
    </div>
  );
}