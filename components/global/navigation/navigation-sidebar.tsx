import { NavGroup } from "@/components/global/navigation/navigation-group";
import type { NavItemType } from "@/components/global/navigation/navigation-item";
import { cn } from "@/lib/utils";

export function SidebarNavigation({
  variant = "sidebar",
  navItems = { main: [], footer: [] },
}: { variant?: "sidebar" | "mobile"; navItems?: Record<string, NavItemType[]> }) {
  return (
    <div className={cn(variant === "sidebar" && "flex flex-col h-full")}>
      <NavGroup
        items={navItems.main}
        className={cn("grid", variant === "sidebar" ? "gap-1 px-2" : "gap-2")}
        variant={variant}
      />
      <div className={cn(variant === "sidebar" ? "mt-auto" : "mt-4 pt-4 border-t")}>
        <NavGroup
          items={navItems.footer}
          className={cn("grid", variant === "sidebar" ? "gap-1 px-2" : "gap-2")}
          variant={variant}
        />
      </div>
    </div>
  );
}
