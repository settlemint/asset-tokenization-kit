"use client";

import { SidebarNavigation } from "@/components/side-bar/sidebar-navigation";
import { ChartNoAxesCombined, Coins, Replace, ShoppingBasket } from "lucide-react";

export default function IssuerSidebar() {
  return (
    <SidebarNavigation
      groups={[
        {
          title: "Dashboard",
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
        // TODO: under buy and swap we will need subsections for types of tokens, there will be differences of sorts of tokens
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
            // TODO: the issuer should be able to allow staking by users
          ],
        },
        // TODO: we need to expose transactions and events that are relevant for the user
      ]}
    />
  );
}
