"use client";

import { SidebarNavigation } from "@/components/side-bar/sidebar-navigation";
import { ChartNoAxesCombined, Coins, Replace, ShoppingBasket } from "lucide-react";

export default function IssuerSidebar() {
  return (
    <SidebarNavigation
      groups={[
        {
          title: "My Portfolio",
          items: [
            {
              title: "Dashboard",
              url: "/user/dashboard",
              icon: ChartNoAxesCombined,
            },
          ],
        },
        {
          title: "My Portfolio",
          items: [
            {
              title: "Portfolio",
              url: "/user/portfolio",
              icon: Coins,
            },
          ],
        },
        {
          title: "Trading",
          items: [
            {
              title: "Buy tokens",
              url: "/user/buy",
              icon: ShoppingBasket,
            },
            {
              title: "Swap tokens",
              url: "/user/swap",
              icon: Replace,
            },
          ],
        },
      ]}
    />
  );
}
