import type { ReactNode } from "react";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";

interface TileDetailLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function TileDetailLayout({
  title,
  subtitle,
  children,
}: TileDetailLayoutProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <RouterBreadcrumb />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight mr-2">{title}</h1>
        </div>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
