import { createFileRoute, redirect } from "@tanstack/react-router";
import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { ClaimsTable } from "@/components/participants/common/claims-table";
import { TileDetailLayout } from "@/components/layout/tile-detail-layout";
import { ORPCError } from "@orpc/client";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const routeParamsSchema = z.object({
  address: z.string().min(1),
});

/**
 * Route configuration for the entity verification detail page
 *
 * This route displays detailed verification information for a specific entity
 * including a claims table with all verifications and management actions.
 *
 * Route path: `/participants/entities/{address}/verifications`
 *
 * @remarks
 * - The address parameter must be a non-empty string representing the entity address
 * - Identity data is fetched using ORPC and cached with TanStack Query
 * - Provides back navigation to the parent entity detail page
 * - Requires appropriate permissions to view entity verification data
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/entities/$address/verifications"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  /**
   * Loader function to prepare entity verification data
   * Fetches entity identity information using the ORPC system.identity.read endpoint
   */
  loader: async ({ params: { address }, context: { queryClient, orpc } }) => {
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({
        input: { id: "default" },
      })
    );

    const roles = system.userPermissions?.roles;

    const canViewEntities = Boolean(
      roles?.identityManager || roles?.claimIssuer
    );

    if (!canViewEntities) {
      throw redirect({
        to: "/participants/entities",
        replace: true,
      });
    }

    const identity = await queryClient.ensureQueryData(
      orpc.system.identity.read.queryOptions({
        input: { identityId: address },
      })
    );

    const account = identity.account;

    const token = await queryClient
      .ensureQueryData(
        orpc.token.read.queryOptions({
          input: { tokenAddress: account?.id ?? address },
        })
      )
      .catch((error: unknown) => {
        if (
          error instanceof ORPCError &&
          (error.status === 404 || error.code === "UNAUTHORIZED")
        ) {
          return undefined;
        }
        throw error;
      });

    const displayName =
      token?.name ??
      account?.contractName ??
      `${address.slice(0, 6)}…${address.slice(-4)}`;

    return {
      identity,
      token: token ?? null,
      displayName,
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsEntities", {
          href: "/participants/entities",
        }),
        {
          title: displayName,
          href: `/participants/entities/${address}`,
        },
        {
          title: "Verifications",
          href: `/participants/entities/${address}/verifications`,
        },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Route component that displays the entity verification detail view
 *
 * This component provides:
 * - Back navigation to the parent entity detail page
 * - ClaimsTable component showing all verifications
 * - Breadcrumb navigation
 */
function RouteComponent() {
  const { identity, displayName } = Route.useLoaderData();
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
      title={t("identities:verificationDetail.title")}
      subtitle={displayName}
    >
      {content}
    </TileDetailLayout>
  );
}
