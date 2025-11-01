import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TileContextValue {
  openDetail?: () => void;
  detailLabel?: string;
}

const TileContext = createContext<TileContextValue | null>(null);

export function useTileContext() {
  return useContext(TileContext);
}

interface TileDetailOptions {
  detailLabel?: string;
  onOpenDetail?: () => void;
}

export type TileProps = ComponentPropsWithoutRef<typeof Card> &
  TileDetailOptions;

/**
 * Uniform container for participant detail tiles so layout stays consistent across pages.
 */
export function Tile({
  className,
  children,
  detailLabel,
  onOpenDetail,
  ...props
}: TileProps) {
  const openDetail = useCallback(() => {
    onOpenDetail?.();
  }, [onOpenDetail]);

  const contextValue = useMemo<TileContextValue>(
    () => ({
      // Default CTA stays disabled until a custom detail handler is provided.
      openDetail: onOpenDetail ? openDetail : undefined,
      detailLabel,
    }),
    [detailLabel, onOpenDetail, openDetail]
  );

  return (
    <TileContext.Provider value={contextValue}>
      <Card
        data-slot="tile"
        className={cn("h-full border-border/60 bg-muted/50 bg-none", className)}
        {...props}
      >
        {children}
      </Card>
    </TileContext.Provider>
  );
}

export function TileHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CardHeader>) {
  return (
    <CardHeader
      data-slot="tile-header"
      className={cn("flex flex-row items-center gap-3", className)}
      {...props}
    />
  );
}

export function TileTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      data-slot="tile-title"
      className={cn("text-lg font-semibold leading-tight", className)}
      {...props}
    />
  );
}

export function TileSubtitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="tile-subtitle"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TileDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="tile-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export type TileIconColor =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "warning"
  | "success";

export interface TileIconProps {
  icon: LucideIcon;
  color?: TileIconColor;
  className?: string;
}

export function TileIcon({ icon: Icon, color, className }: TileIconProps) {
  const isSemanticColor = color === "warning" || color === "success";

  return (
    <span
      data-slot="tile-icon"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        isSemanticColor && color === "warning" && "bg-warning/10 text-warning",
        isSemanticColor && color === "success" && "bg-success/10 text-success",
        className
      )}
      style={
        color && !isSemanticColor
          ? {
              backgroundColor: `color-mix(in srgb, var(--${color}) 10%, transparent)`,
              color: `var(--${color})`,
            }
          : undefined
      }
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

export type TileBadgeProps = Omit<
  ComponentPropsWithoutRef<typeof Badge>,
  "variant"
> & {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
};

export function TileBadge({ className, variant, ...props }: TileBadgeProps) {
  const isSuccessVariant = variant === "success";
  const isWarningVariant = variant === "warning";

  return (
    <Badge
      data-slot="tile-badge"
      variant={isSuccessVariant || isWarningVariant ? "default" : variant}
      className={cn(
        "shrink-0",
        isSuccessVariant && "border-success/20 bg-success/10 text-success",
        isWarningVariant && "border-warning/20 bg-warning/10 text-warning",
        className
      )}
      {...props}
    />
  );
}

export function TileHeaderContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="tile-header-content"
      className={cn("flex flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

export function TileContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CardContent>) {
  return (
    <CardContent
      data-slot="tile-content"
      className={cn("flex flex-1 flex-col gap-4", className)}
      {...props}
    />
  );
}

export function TileFooter({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof CardFooter>) {
  const context = useTileContext();
  const shouldRenderDefaultAction = !children && context?.openDetail;

  return (
    <CardFooter
      data-slot="tile-footer"
      className={cn(
        "mt-auto flex items-center justify-end gap-3 border-t border-border/60 pt-6",
        className
      )}
      {...props}
    >
      {shouldRenderDefaultAction ? <TileFooterAction /> : children}
    </CardFooter>
  );
}

export interface TileFooterActionProps
  extends ComponentPropsWithoutRef<typeof Button> {
  label?: ReactNode;
  to?: string;
  params?: Record<string, unknown>;
  search?: Record<string, unknown>;
}

export function TileFooterAction({
  label,
  children,
  onClick,
  to,
  params,
  search,
  ...props
}: TileFooterActionProps) {
  const context = useTileContext();
  const navigate = useNavigate();

  const handleClick: NonNullable<TileFooterActionProps["onClick"]> = async (
    event
  ) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (context?.openDetail) {
      context.openDetail();
      return;
    }

    if (to) {
      await navigate({ to, params, search });
    }
  };

  const content = children ?? label ?? context?.detailLabel;

  if (!content) {
    return null;
  }

  if (props.asChild && to) {
    return (
      <Button {...props} asChild>
        <Link to={to} params={params} search={search}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button type="button" onClick={handleClick} {...props}>
      {content}
    </Button>
  );
}

export const tileComponents = {
  Root: Tile,
  Header: TileHeader,
  HeaderContent: TileHeaderContent,
  Title: TileTitle,
  Subtitle: TileSubtitle,
  Description: TileDescription,
  Icon: TileIcon,
  Badge: TileBadge,
  Content: TileContent,
  Footer: TileFooter,
  FooterAction: TileFooterAction,
};
