import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { EntityStatusBadge } from "@/components/participants/entities/entity-status-badge";
import { BasicInfoTile } from "@/components/participants/entities/tiles/basic-info-tile";
import { IdentityClaimsTile } from "@/components/participants/common/tiles/identity-claims-tile";
import { Badge } from "@/components/ui/badge";
import { ORPCError } from "@orpc/client";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useEntityDisplayData } from "./use-entity-display-data";

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

    const buildBreadcrumb = (title: string) => [
      createI18nBreadcrumbMetadata("participants", {
        href: "/participants/users",
      }),
      createI18nBreadcrumbMetadata("participantsEntities", {
        href: "/participants/entities",
      }),
      {
        title,
        href: `/participants/entities/${address}`,
      },
    ];

    const isRegistered =
      identity.registered !== undefined && identity.registered !== false
        ? identity.registered.isRegistered
        : false;

    const claimsData = {
      claims: identity.claims,
      identity: identity.id,
      isRegistered,
      account,
      isContract: identity.isContract,
    };

    if (!account) {
      const breadcrumbTitle = `${address.slice(0, 6)}…${address.slice(-4)}`;

      return {
        identity,
        token: null,
        claimsData,
        breadcrumb: buildBreadcrumb(breadcrumbTitle),
      };
    }

    const token = await queryClient
      .ensureQueryData(
        orpc.token.read.queryOptions({
          input: { tokenAddress: account.id },
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

    const breadcrumbTitle =
      token?.name ??
      account.contractName ??
      `${address.slice(0, 6)}…${address.slice(-4)}`;

    return {
      identity,
      token: token ?? null,
      claimsData,
      breadcrumb: buildBreadcrumb(breadcrumbTitle),
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
  const location = useLocation();
  const { t } = useTranslation([
    "entities",
    "identities",
    "tokens",
    "asset-types",
    "common",
  ]);

  const routeContext = Route.useRouteContext();
  const navigate = useNavigate();

  const { identity, token, displayName } = useEntityDisplayData({
    address,
    loaderIdentity,
    loaderToken: loaderToken ?? null,
    createIdentityQueryOptions: (args) =>
      routeContext.orpc.system.identity.read.queryOptions(args),
    createTokenQueryOptions: (args) =>
      routeContext.orpc.token.read.queryOptions(args),
  });

  if (location.pathname.endsWith("/verifications")) {
    return <Outlet />;
  }

  const assetTypeKey = token?.type ?? null;
  const entityTypeLabel = assetTypeKey
    ? t(`asset-types:types.${assetTypeKey}.name`)
    : undefined;

  const contractAddress = identity?.account?.id ?? identity?.id;
  const identityAddress = identity?.id ?? address;

  const truncatedAddress = (value: string) =>
    value.length <= 12 ? value : `${value.slice(0, 6)}…${value.slice(-4)}`;

  if (!identity || !identity.account) {
    return (
      <div className="space-y-6 p-6">
        <RouterBreadcrumb />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight mr-2">
            {displayName}
          </h1>
          <EntityStatusBadge isRegistered={claimsData.isRegistered} />
        </div>
        {entityTypeLabel ? (
          <p className="text-sm font-medium text-muted-foreground">
            {entityTypeLabel}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {contractAddress ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t("entities:entityTable.columns.address")}:
              </span>
              <CopyToClipboard
                value={contractAddress}
                className="inline-flex items-center gap-2"
              >
                <Badge variant="outline" className="font-mono">
                  {truncatedAddress(contractAddress)}
                </Badge>
              </CopyToClipboard>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t("entities:entityTable.columns.identityAddress")}:
            </span>
            <CopyToClipboard
              value={identityAddress}
              className="inline-flex items-center gap-2"
            >
              <Badge variant="outline" className="font-mono">
                {truncatedAddress(identityAddress)}
              </Badge>
            </CopyToClipboard>
          </div>
        </div>
      </div>
      <div className="grid auto-rows-fr items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BasicInfoTile identity={identity} token={token} />
        <IdentityClaimsTile
          identity={identity}
          onManageVerifications={() => {
            void navigate({
              to: "/participants/entities/$address/verifications",
              params: { address },
            });
          }}
        />
      </div>
      <Outlet />
    </div>
  );
}
