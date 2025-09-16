import { createFileRoute } from "@tanstack/react-router";

/**
 * Default claim detail page that shows comprehensive claim information
 *
 * This is the default tab/view when viewing a specific account's claims.
 * It displays all claim data, identity information, and verification status
 * for the specified account ID (wallet address).
 *
 * Route path: `/admin/claim-management/{accountId}`
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/identity-management/$accountId/"
)({
  component: ClaimDetailPage,
});

function ClaimDetailPage() {
  return (
    <div className="space-y-6">
      <p>Under construction</p>
    </div>
  );
}
