import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { useNavigate, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  detailTo?: string;
  detailParams?: Record<string, unknown>;
  detailSearch?: Record<string, unknown>;
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
  detailTo,
  detailParams,
  detailSearch,
  onOpenDetail,
  ...props
}: TileProps) {
  const navigate = useNavigate();

  const openDetail = useCallback(() => {
    if (onOpenDetail) {
      onOpenDetail();
      return;
    }

    if (detailTo) {
      navigate({ to: detailTo, params: detailParams, search: detailSearch });
    }
  }, [detailParams, detailSearch, detailTo, navigate, onOpenDetail]);

  const contextValue = useMemo<TileContextValue>(
    () => ({
      openDetail: detailTo || onOpenDetail ? openDetail : undefined,
      detailLabel,
    }),
    [detailLabel, detailTo, onOpenDetail, openDetail]
  );

  return (
    <TileContext.Provider value={contextValue}>
      <Card
        data-slot="tile"
        className={cn("flex h-full flex-col gap-6 px-6", className)}
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
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="tile-header"
      className={cn("flex flex-col gap-1", className)}
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

export function TileContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
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
}: ComponentPropsWithoutRef<"div">) {
  const context = useTileContext();
  const shouldRenderDefaultAction = !children && context?.openDetail;

  return (
    <div
      data-slot="tile-footer"
      className={cn(
        "mt-auto flex items-center justify-end gap-3 border-t border-border/60 pt-4",
        className
      )}
      {...props}
    >
      {shouldRenderDefaultAction ? <TileFooterAction /> : children}
    </div>
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

  const handleClick: NonNullable<TileFooterActionProps["onClick"]> = (
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
      navigate({ to, params, search });
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
  Title: TileTitle,
  Subtitle: TileSubtitle,
  Content: TileContent,
  Footer: TileFooter,
  FooterAction: TileFooterAction,
};
