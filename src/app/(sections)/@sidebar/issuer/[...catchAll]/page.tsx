"use client";

import { SidebarNavigation } from "@/components/side-bar/sidebar-navigation";
import { ChartNoAxesCombined, Coins } from "lucide-react";

export default function IssuerSidebar() {
  return (
    <SidebarNavigation
      groups={[
        {
          title: "Asset Management",
          items: [
            {
              title: "Dashboard",
              url: "/issuer/dashboard",
              icon: ChartNoAxesCombined,
            },
            {
              title: "Tokens",
              url: "/issuer/tokens",
              icon: Coins,
            },
            // {
            //   title: "Playground",
            //   url: "#",
            //   icon: SquareTerminal,
            //   items: [
            //     {
            //       title: "History",
            //       url: "#",
            //     },
            //   ],
            // },
          ],
        },
      ]}
    />
  );
}
