"use client";

import { SidebarNavigation } from "@/components/side-bar/sidebar-navigation";
import { ChartCandlestick, ChartNoAxesCombined, Coins } from "lucide-react";

export default function IssuerSidebar() {
  return (
    <SidebarNavigation
      groups={[
        {
          title: "",
          items: [
            {
              title: "Dashboard",
              url: "/issuer/dashboard",
              icon: ChartNoAxesCombined,
            },
          ],
        },
        {
          title: "Asset Management",
          items: [
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
        {
          title: "Trading Management",
          items: [
            {
              title: "Pairs",
              url: "/issuer/pairs",
              icon: ChartCandlestick,
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
