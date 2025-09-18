interface IdentityTabConfig {
  href: string;
  tabKey: "details" | "claims";
}

interface GetIdentityTabConfigurationProps {
  address: string;
}

/**
 * Returns the tab configuration for identity management pages
 * Includes details and claims tabs for comprehensive identity view
 */
export function getIdentityTabConfiguration({
  address,
}: GetIdentityTabConfigurationProps): IdentityTabConfig[] {
  return [
    {
      href: `/admin/identity-management/${address}`,
      tabKey: "details",
    },
    {
      href: `/admin/identity-management/${address}/claims`,
      tabKey: "claims",
    },
  ];
}
