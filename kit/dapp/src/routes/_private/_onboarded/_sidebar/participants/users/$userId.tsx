import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { BasicInfoTile } from "@/components/participants/users/tiles/basic-info-tile";
import { IdentityClaimsTile } from "@/components/participants/common/tiles/identity-claims-tile";
import { Badge } from "@/components/ui/badge";
import { getUserDisplayName } from "@/lib/utils/user-display-name";
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import { ORPCError } from "@orpc/client";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const routeParamsSchema = z.object({
  userId: z.string().min(1),
});

/**
 * Route configuration for the user details page
 *
 * This route handles the userId parameter and provides shared data loading
 * for all user detail sub-routes. The route is authenticated and requires
 * the user to be onboarded.
 *
 * Route path: `/participants/users/{userId}`
 *
 * @remarks
 * - The userId parameter must be a non-empty string
 * - User data is fetched using ORPC and cached with TanStack Query
 * - Provides shared layout for user details and nested sub-pages
 * - Requires appropriate permissions to view user data
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/participants/users/$userId',
 *   params: { userId: 'user-123' }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/users/$userId"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  /**
   * Loader function to prepare user data
   * Fetches user information using the ORPC user.read endpoint
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

    // get the user
    const user = await queryClient.ensureQueryData(
      orpc.user.readByUserId.queryOptions({ input: { userId } })
    );
    const identity = await queryClient
      .ensureQueryData(
        orpc.system.identity.readByWallet.queryOptions({
          input: { wallet: user.wallet ?? "" },
        })
      )
      .catch((error: unknown) => {
        if (error instanceof ORPCError && error.status === 404) {
          return undefined;
        }
        throw error;
      });
    return {
      user,
      identity,
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsUsers", {
          href: `/participants/users`,
        }),
        { title: user.name, href: `/participants/users/${userId}` },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Parent route component with shared layout and tab navigation
 *
 * This component provides the shared layout for all user detail pages
 * including header, breadcrumbs, tabs, and renders child routes through Outlet.
 */
function RouteComponent() {
  const { user: loaderUser, identity: loaderIdentity } = Route.useLoaderData();
  const { userId } = Route.useParams();
  const location = useLocation();
  const routeContext = Route.useRouteContext();
  const navigate = useNavigate();
  const { orpc } = routeContext;
  // Subscribe to live user data so UI reacts to updates
  const { data: queriedUser } = useQuery(
    orpc.user.readByUserId.queryOptions({
      input: { userId },
    })
  );

  const user = queriedUser ?? loaderUser;

  // Subscribe to live identity data if available
  const { data: queriedIdentity } = useQuery({
    ...orpc.system.identity.readByWallet.queryOptions({
      input: { wallet: user.wallet ?? "" },
    }),
    enabled: Boolean(user.wallet),
  });

  const identity = queriedIdentity ?? loaderIdentity;
  const { t } = useTranslation("user");

  if (location.pathname.endsWith("/verifications")) {
    return <Outlet />;
  }

  type ExtendedUser = typeof user & {
    roles?: Partial<Record<AccessControlRoles, boolean>>;
    isAdmin?: boolean | null;
    isRegistered?: boolean;
    identity?: string | null;
  };

  const detailedUser = user as ExtendedUser;
  const displayName = getUserDisplayName(detailedUser);
  const isAdminType =
    Boolean(detailedUser.isAdmin) ||
    Boolean(detailedUser.roles?.admin) ||
    Boolean(detailedUser.roles?.systemManager);
  const isTrustedIssuerType =
    Boolean(detailedUser.roles?.claimIssuer) ||
    Boolean(detailedUser.roles?.trustedIssuersMetaRegistryModule);
  const participantTypeKey = isAdminType
    ? ("admin" as const)
    : isTrustedIssuerType
      ? ("trustedIssuer" as const)
      : ("investor" as const);
  const isRegistered = Boolean(detailedUser.isRegistered);
  const statusKey = isRegistered ? "registered" : "pending";
  const walletAddress = detailedUser.wallet ?? null;
  const identityAddress = detailedUser.identity ?? null;
  const noValueLabel = t("management.table.fallback.none");
  const truncated = (value: string) =>
    value.length <= 12 ? value : `${value.slice(0, 6)}…${value.slice(-4)}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight mr-2">
            {displayName || user.email}
          </h1>
          <Badge variant="outline">
            {t(`management.table.type.${participantTypeKey}`)}
          </Badge>
          <Badge variant={isRegistered ? "default" : "outline"}>
            {t(`management.table.status.${statusKey}`)}
          </Badge>
        </div>
        {user.email ? (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t("management.table.columns.wallet")}:
            </span>
            {walletAddress ? (
              <CopyToClipboard
                value={walletAddress}
                className="inline-flex items-center gap-2"
              >
                <Badge variant="outline" className="font-mono">
                  {truncated(walletAddress)}
                </Badge>
              </CopyToClipboard>
            ) : (
              <span>{noValueLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t("management.table.columns.identity")}:
            </span>
            {identityAddress ? (
              <CopyToClipboard
                value={identityAddress}
                className="inline-flex items-center gap-2"
              >
                <Badge variant="outline" className="font-mono">
                  {truncated(identityAddress)}
                </Badge>
              </CopyToClipboard>
            ) : (
              <span>{noValueLabel}</span>
            )}
          </div>
        </div>
      </div>
      <div className="grid auto-rows-fr items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BasicInfoTile user={user} />
        {identity && (
          <IdentityClaimsTile
            identity={identity}
            onManageVerifications={() => {
              void navigate({
                to: "/participants/users/$userId/verifications",
                params: { userId },
              });
            }}
          />
        )}
      </div>
      <Outlet />
    </div>
  );
}
