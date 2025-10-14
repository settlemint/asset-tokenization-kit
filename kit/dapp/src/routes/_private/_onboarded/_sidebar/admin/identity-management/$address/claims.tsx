import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ClaimsTable } from "@/components/identity/claims-table";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

/**
 * Claims tab page that displays all claims associated with an identity
 *
 * This route shows a table of claims with their status, name, and issuer information.
 * It uses the mock data loaded by the parent route.
 *
 * Route path: `/admin/identity-management/{address}/claims`
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/identity-management/$address/claims"
)({
  errorComponent: DefaultCatchBoundary,
  component: ClaimsPage,
});

function ClaimsPage() {
  const { claimsData } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/admin/identity-management/$address",
  });

  return (
    <div className="space-y-4">
      <ClaimsTable identityAddress={claimsData.identity} />
    </div>
  );
}
