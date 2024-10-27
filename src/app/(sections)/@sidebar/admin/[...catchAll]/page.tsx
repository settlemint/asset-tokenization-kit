"use client";

import { SidebarNavigation } from "@/components/side-bar/sidebar-navigation";
import { ChartNoAxesCombined, Users } from "lucide-react";

export default function AdminSidebar() {
  return (
    <SidebarNavigation
      groups={[
        {
          title: "Platform Management",
          items: [
            {
              title: "Dashboard",
              url: "/admin/dashboard",
              icon: ChartNoAxesCombined,
            },
            {
              title: "Users",
              url: "/admin/users",
              icon: Users,
            },
          ],
        },
      ]}
    />
  );
}
