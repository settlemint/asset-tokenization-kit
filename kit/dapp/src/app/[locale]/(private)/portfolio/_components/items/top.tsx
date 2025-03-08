import type { NavElement } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/animated-icons/activity";
import { ChartScatterIcon } from "@/components/ui/animated-icons/chart-scatter";
import { SettingsGearIcon } from "@/components/ui/animated-icons/settings-gear";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { WalletIcon } from "@/components/ui/animated-icons/wallet";

export const topItems: NavElement[] = [
  {
    label: "Dashboard",
    icon: <ChartScatterIcon className="size-4" />,
    path: "/portfolio",
  },
  {
    label: "My Assets",
    icon: <WalletIcon className="size-4" />,
    path: "/portfolio/my-assets",
  },
  {
    label: "Activity",
    icon: <ActivityIcon className="size-4" />,
    path: "/portfolio/activity",
  },
  {
    label: "Settings",
    icon: <SettingsGearIcon className="size-4" />,
    path: "/portfolio/settings/security",
    subItems: [
      {
        label: "Profile",
        icon: <UsersIcon className="size-4" />,
        path: "/portfolio/settings/profile",
      },
    ],
  },
];
