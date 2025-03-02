import type { NavElement } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/animated-icons/activity";
import { ChartScatterIcon } from "@/components/ui/animated-icons/chart-scatter";
import { WalletIcon } from "@/components/ui/animated-icons/wallet";

export const topItems: NavElement[] = [
  {
    label: "Dashboard",
    icon: <ChartScatterIcon className="h-4 w-4" />,
    path: "/portfolio",
  },
  {
    label: "My Assets",
    icon: <WalletIcon className="h-4 w-4" />,
    path: "/portfolio/my-assets",
  },
  {
    label: "Activity",
    icon: <ActivityIcon className="h-4 w-4" />,
    path: "/portfolio/activity",
  },
];
