export interface UserTabConfigurationParams {
  userId: string;
}

export interface UserTabConfig {
  href: string;
  tabKey: "details" | "claims";
  badgeType?: "claims";
}

/**
 * Generates the tab configuration for a user based on their role and status
 */
export function getUserTabConfiguration({
  userId,
}: UserTabConfigurationParams): UserTabConfig[] {
  const baseUrl = `/participants/users/${userId}`;

  const tabs: UserTabConfig[] = [
    {
      tabKey: "details",
      href: baseUrl,
    },
  ];

  return tabs;
}
