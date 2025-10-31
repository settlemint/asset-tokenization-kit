import { createFileRoute, redirect } from "@tanstack/react-router";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ClaimsTable } from "@/components/participants/common/claims-table";
import { TileDetailLayout } from "@/components/layout/tile-detail-layout";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import { ORPCError } from "@orpc/client";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const routeParamsSchema = z.object({
  userId: z.string().min(1),
});

/**
 * Route configuration for the user verification detail page
 *
 * This route displays detailed verification information for a specific user
 * including a claims table with all verifications and management actions.
 *
 * Route path: `/participants/users/{userId}/verifications`
 *
 * @remarks
 * - The userId parameter must be a non-empty string representing the user ID
 * - User and identity data is fetched using ORPC and cached with TanStack Query
 * - Provides back navigation to the parent user detail page
 * - Requires appropriate permissions to view user verification data
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/users/$userId/verifications"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  /**
   * Loader function to prepare user verification data
   * Fetches user and identity information using ORPC endpoints
   */
  loader: async ({ params: { userId }, context: { queryClient, orpc } }) => {
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({
        input: { id: "default" },
      })
    );

    const roles = system.userPermissions?.roles;
    const canViewUsers = Boolean(roles?.identityManager || roles?.claimIssuer);

    if (!canViewUsers) {
      throw redirect({
        to: "/participants/users",
        replace: true,
      });
    }

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

    const displayName = getUserDisplayName(user) || user.email;

    return {
      user,
      identity,
      displayName,
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsUsers", {
          href: "/participants/users",
        }),
        {
          title: displayName,
          href: `/participants/users/${userId}`,
        },
        {
          title: "Verifications",
          href: `/participants/users/${userId}/verifications`,
        },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Route component that displays the user verification detail view
 *
 * This component provides:
 * - Back navigation to the parent user detail page
 * - ClaimsTable component showing all verifications
 * - Breadcrumb navigation
 */
function RouteComponent() {
  const { identity, displayName } = Route.useLoaderData();
  const { userId } = Route.useParams();
  const { t } = useTranslation(["identities", "common"]);

  const content = identity ? (
    <ClaimsTable identityAddress={identity.id} />
  ) : (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">
        {t("identities:verificationDetail.noIdentity")}
      </p>
    </div>
  );

  return (
    <TileDetailLayout
      backLink={{
        to: "/participants/users/$userId",
        params: { userId },
        label: t("common:actions.back"),
      }}
      title={t("identities:verificationDetail.title")}
      subtitle={displayName}
    >
      {content}
    </TileDetailLayout>
  );
}
