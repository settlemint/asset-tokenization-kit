import type { User } from "@/orpc/routes/user/routes/user.me.schema";

export interface UserTabConfigurationParams {
  userId: string;
  user: User;
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
  user,
}: UserTabConfigurationParams): UserTabConfig[] {
  const baseUrl = `/admin/user-management/${userId}`;

  const tabs: UserTabConfig[] = [
    {
      tabKey: "details",
      href: baseUrl,
    },
  ];

  // Add claims tab if user has identity or wallet
  if (user.identity || user.wallet) {
    tabs.push({
      tabKey: "claims",
      href: `${baseUrl}/claims`,
      badgeType: "claims",
    });
  }

  return tabs;
}
