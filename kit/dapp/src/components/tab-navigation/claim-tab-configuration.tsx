interface ClaimTabConfig {
  href: string;
  tabKey: "details";
}

interface GetClaimTabConfigurationProps {
  accountId: string;
}

/**
 * Returns the tab configuration for identity management pages
 * Currently only includes the details tab, but can be extended
 * for additional identity-related tabs in the future
 */
export function getClaimTabConfiguration({
  accountId,
}: GetClaimTabConfigurationProps): ClaimTabConfig[] {
  return [
    {
      href: `/admin/identity-management/${accountId}`,
      tabKey: "details",
    },
  ];
}
