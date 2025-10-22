import { createI18nBreadcrumbMetadata } from "@/components/breadcrumb/metadata";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { IdentityStatusBadge } from "@/components/identity/identity-status-badge";
import { ManageIdentityDropdown } from "@/components/manage-dropdown/manage-identity-dropdown";
import { getIdentityTabConfiguration } from "@/components/tab-navigation/identity-tab-configuration";
import { TabNavigation } from "@/components/tab-navigation/tab-navigation";
import { Web3Address } from "@/components/web3/web3-address";
import {
  CLAIM_ISSUER_ROLE,
  IDENTITY_MANAGER_ROLE,
} from "@/lib/constants/roles";
import { client } from "@/orpc/orpc-client";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const routeParamsSchema = z.object({
  address: z.string().min(1),
});

/**
 * Route configuration for the identity details page parent route
 *
 * This route handles the address parameter and provides shared data loading
 * for all identity detail sub-routes. The route is authenticated and requires
 * the user to be onboarded.
 *
 * Route path: `/participants/entities/{address}`
 *
 * @remarks
 * - The address parameter must be a non-empty string (wallet/identity address)
 * - Identity data uses hardcoded dummy data for now
 * - This is a parent route that provides shared layout and tab navigation
 * - Requires appropriate permissions to view identity data
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/participants/entities/$address',
 *   params: { address: '0x1234567890123456789012345678901234567890' }
 * });
 * ```
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/entities/$address"
)({
  parseParams: (params) => routeParamsSchema.parse(params),
  /**
   * Loader function to fetch identity data from ORPC API
   */
  loader: async ({ context: { queryClient, orpc }, params: { address } }) => {
    const system = await queryClient.ensureQueryData(
      orpc.system.read.queryOptions({
        input: { id: "default" },
      })
    );

    const roles = system.userPermissions?.roles;

    const canViewEntities = Boolean(
      roles?.[IDENTITY_MANAGER_ROLE.fieldName] ||
        roles?.[CLAIM_ISSUER_ROLE.fieldName]
    );

    if (!canViewEntities) {
      throw redirect({
        to: "/",
      });
    }

    const identity = await client.system.identity.read({
      identityId: address,
    });

    const claimsData = {
      claims: identity.claims,
      identity: identity.id,
      isRegistered: identity.registered
        ? identity.registered.isRegistered
        : false,
      account: identity.account,
      isContract: identity.isContract,
    };

    return {
      claimsData,
      breadcrumb: [
        createI18nBreadcrumbMetadata("participants", {
          href: "/participants/users",
        }),
        createI18nBreadcrumbMetadata("participantsEntities", {
          href: "/participants/entities",
        }),
        {
          title: `${address.slice(0, 6)}...${address.slice(-4)}`,
          href: `/participants/entities/${address}`,
        },
      ],
    };
  },
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Parent route component with shared layout and tab navigation
 *
 * This component provides the shared layout for all identity detail pages
 * including header, breadcrumbs, tabs, and renders child routes through Outlet.
 */
function RouteComponent() {
  const { claimsData } = Route.useLoaderData();
  const { address } = Route.useParams();
  const { t } = useTranslation(["identities", "common"]);

  // Generate tab configuration based on identity data
  // Only memoize based on properties that affect tab configuration
  const tabConfigs = useMemo(
    () => getIdentityTabConfiguration({ address }),
    [address]
  );

  // Transform tab configurations to TabItemProps with translations
  const tabs = useMemo(() => {
    type IdentityTabKey = "details" | "claims";
    type IdentityTabConfig = { href: string; tabKey: IdentityTabKey };
    return (tabConfigs as IdentityTabConfig[]).map((config) => ({
      href: config.href,
      name: t(`identities:tabs.${config.tabKey}`),
    }));
  }, [tabConfigs, t]);

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              <Web3Address
                address={getEthereumAddress(address)}
                showPrettyName={false}
                copyToClipboard={false}
              />
            </h1>
            <IdentityStatusBadge isRegistered={claimsData.isRegistered} />
          </div>
          <ManageIdentityDropdown identity={claimsData} />
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation items={tabs} />

      {/* Child Routes */}
      <Outlet />
    </div>
  );
}
