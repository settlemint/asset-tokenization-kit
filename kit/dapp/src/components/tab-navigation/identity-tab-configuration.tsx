interface IdentityTabConfig {
  href: string;
  tabKey: "details";
}

interface GetIdentityTabConfigurationProps {
  address: string;
}

/**
 * Returns the tab configuration for identity management pages
 * Currently only includes the details tab, but can be extended
 * for additional identity-related tabs in the future
 */
export function getIdentityTabConfiguration({
  address,
}: GetIdentityTabConfigurationProps): IdentityTabConfig[] {
  return [
    {
      href: `/admin/identity-management/${address}`,
      tabKey: "details",
    },
  ];
}
