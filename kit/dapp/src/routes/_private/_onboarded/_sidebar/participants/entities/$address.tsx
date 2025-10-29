import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { IdentityStatusBadge } from "@/components/identity/identity-status-badge";
import { ManageIdentityDropdown } from "@/components/manage-dropdown/manage-identity-dropdown";
import { BasicInfoTile } from "@/components/participants/entities/tiles/basic-info-tile";
import { Badge } from "@/components/ui/badge";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const routeParamsSchema = z.object({
  address: z.string().min(1),
});

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/entities/$address"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  loader: async ({ context: { queryClient, orpc }, params: { address } }) => {
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
        to: "/",
      });
    }

    const identity = await queryClient.ensureQueryData(
      orpc.system.identity.read.queryOptions({
        input: { identityId: address },
      })
    );

    const token = await queryClient
      .ensureQueryData(
        orpc.token.read.queryOptions({
          input: { tokenAddress: identity.account.id },
        })
      )
      .catch((error: unknown) => {
        if (error instanceof ORPCError && error.status === 404) {
          return undefined;
        }
        throw error;
      });

    const isRegistered =
      identity.registered !== undefined && identity.registered !== false
        ? identity.registered.isRegistered
        : false;

    const claimsData = {
      claims: identity.claims,
      identity: identity.id,
      isRegistered,
      account: identity.account,
      isContract: identity.isContract,
    };

    const breadcrumbTitle =
      token?.name ??
      identity.account.contractName ??
      `${address.slice(0, 6)}…${address.slice(-4)}`;

    return {
      identity,
      token: token ?? null,
      claimsData,
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsEntities", {
          href: "/participants/entities",
        }),
        {
          title: breadcrumbTitle,
          href: `/participants/entities/${address}`,
        },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  const {
    identity: loaderIdentity,
    token: loaderToken,
    claimsData,
  } = Route.useLoaderData();
  const { address } = Route.useParams();
  const { t } = useTranslation([
    "entities",
    "identities",
    "tokens",
    "asset-types",
    "common",
  ]);

  const routeContext = Route.useRouteContext();

  const { data: queriedIdentity } = useQuery(
    routeContext.orpc.system.identity.read.queryOptions({
      input: { identityId: address },
    })
  );

  const identity = queriedIdentity ?? loaderIdentity;
  const tokenAddress = identity?.account?.id;

  const { data: queriedToken } = useQuery({
    ...routeContext.orpc.token.read.queryOptions({
      input: { tokenAddress: tokenAddress ?? address },
    }),
    enabled: Boolean(tokenAddress),
  });

  const token = queriedToken ?? loaderToken ?? null;

  const displayName =
    token?.name ??
    identity?.account?.contractName ??
    `${address.slice(0, 6)}…${address.slice(-4)}`;

  const entityTypeLabel = token?.type
    ? t(`asset-types.types.${token.type}.name`, { defaultValue: token.type })
    : undefined;

  const entityDescription = token?.type
    ? t(`asset-types.types.${token.type}.description`, {
        defaultValue: token.type,
      })
    : (identity?.account?.contractName ?? "");

  if (!identity || !identity.account) {
    return (
      <div className="space-y-6 p-6">
        <RouterBreadcrumb />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <RouterBreadcrumb />
      <div className="space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight mr-2">
                {displayName}
              </h1>
              {entityTypeLabel ? (
                <Badge variant="outline">{entityTypeLabel}</Badge>
              ) : null}
              <IdentityStatusBadge isRegistered={claimsData.isRegistered} />
            </div>
            {entityDescription ? (
              <p className="text-sm text-muted-foreground">
                {entityDescription}
              </p>
            ) : null}
          </div>
          <ManageIdentityDropdown identity={claimsData} />
        </div>
      </div>
      <div className="grid auto-rows-fr items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BasicInfoTile identity={identity} token={token} />
      </div>
    </div>
  );
}
