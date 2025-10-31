import type { ReactNode } from "react";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface TileDetailLayoutProps {
  backLink: {
    to: string;
    params?: Record<string, string>;
    label: string;
  };
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function TileDetailLayout({
  backLink,
  title,
  subtitle,
  children,
}: TileDetailLayoutProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <RouterBreadcrumb />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={backLink.to} params={backLink.params}>
              <ArrowLeft className="h-4 w-4" />
              {backLink.label}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
