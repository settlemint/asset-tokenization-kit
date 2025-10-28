import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { ArrowLeft } from "lucide-react";

import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TileDetailLayoutProps
  extends ComponentPropsWithoutRef<"section"> {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  backLabel?: string;
  backTo?: string;
  backParams?: Record<string, unknown>;
  backSearch?: Record<string, unknown>;
  onBack?: () => void;
}

/**
 * Full-width page shell for tile detail views. Provides a consistent back button
 * and centered detail card matching the design comps.
 */
export function TileDetailLayout({
  title,
  subtitle,
  description,
  icon,
  actions,
  footer,
  children,
  className,
  backLabel = "Back to overview",
  backTo,
  backParams,
  backSearch,
  onBack,
  ...props
}: TileDetailLayoutProps) {
  const navigate = useNavigate();

  const handleDefaultBack = () => {
    if (backTo) {
      navigate({ to: backTo, params: backParams, search: backSearch });
      return;
    }

    navigate({ to: ".." });
  };

  const backButton = (() => {
    if (onBack) {
      return (
        <Button
          type="button"
          variant="ghost"
          className="px-2 text-sm font-medium"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 size-4" />
          {backLabel}
        </Button>
      );
    }

    if (backTo) {
      return (
        <Button asChild variant="ghost" className="px-2 text-sm font-medium">
          <Link to={backTo} params={backParams} search={backSearch}>
            <ArrowLeft className="mr-2 size-4" />
            {backLabel}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        type="button"
        variant="ghost"
        className="px-2 text-sm font-medium"
        onClick={handleDefaultBack}
      >
        <ArrowLeft className="mr-2 size-4" />
        {backLabel}
      </Button>
    );
  })();

  return (
    <section
      data-slot="tile-detail-layout"
      className={cn("flex h-full flex-col gap-8", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        {backButton}
        {actions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : null}
      </div>

      <Card className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 rounded-2xl px-12 py-16 text-center">
        {icon ? (
          <div className="flex items-center justify-center rounded-full bg-primary/10 p-4 text-primary">
            {icon}
          </div>
        ) : null}

        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="text-base font-medium text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {children ? (
          <div className="w-full max-w-2xl text-left text-sm text-muted-foreground">
            {children}
          </div>
        ) : null}

        {footer ? <div className="w-full max-w-2xl">{footer}</div> : null}
      </Card>
    </section>
  );
}
