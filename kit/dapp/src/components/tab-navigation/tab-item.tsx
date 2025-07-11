import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { NavigationMenuItem } from "../ui/navigation-menu";

interface TabItemProps {
  href: string;
  name: ReactNode;
}

export function TabItem({ href, name }: TabItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <NavigationMenuItem>
      <Link
        to={href}
        className={cn(
          "group/tab relative inline-flex h-10 items-center px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
          isActive ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {name}
        <span
          className={cn(
            "absolute bottom-0 left-0 h-0.5 w-full scale-x-0 transform bg-accent transition-transform duration-200 ease-out group-hover/tab:scale-x-100",
            isActive && "scale-x-100"
          )}
        />
      </Link>
    </NavigationMenuItem>
  );
}
