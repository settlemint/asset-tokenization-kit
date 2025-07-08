"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { Fragment } from "react";
import { useTranslation, type TFunction } from "react-i18next";
import type { BreadcrumbMetadata } from "./metadata";

interface BreadcrumbSegment {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

/**
 * Derives the display title for a breadcrumb item
 */
function deriveBreadcrumbTitle(
  breadcrumbMeta: BreadcrumbMetadata | undefined,
  fallbackTitle: string,
  t: TFunction
): string {
  const namespace = breadcrumbMeta?.i18nNamespace ?? "navigation";

  // Determine the title to display
  if (breadcrumbMeta?.title) {
    // Handle i18n keys
    if (breadcrumbMeta.isI18nKey) {
      // Use the translation with dynamic key and namespace
      // The key might not exist in TypeScript's types, but i18next handles this gracefully
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return t(breadcrumbMeta.title as any, { ns: namespace });
    }
    return breadcrumbMeta.title;
  }

  return fallbackTitle;
}

/**
 * Component for rendering breadcrumb item content
 */
function BreadcrumbContent({ title }: { title: string }) {
  if (title === "home") {
    return <Home className="h-3 w-3" />;
  }
  return <>{title}</>;
}

/**
 * Component for rendering a single breadcrumb item
 */
function BreadcrumbItemRender({
  breadcrumbMeta,
  fallbackTitle,
  href,
  isCurrentPage,
}: {
  breadcrumbMeta?: BreadcrumbMetadata;
  fallbackTitle: string;
  href?: string;
  isCurrentPage?: boolean;
}) {
  const { t } = useTranslation(["navigation"]);
  const title = deriveBreadcrumbTitle(breadcrumbMeta, fallbackTitle, t);

  return (
    <BreadcrumbItem className="text-xs">
      {isCurrentPage ? (
        <BreadcrumbPage>
          <BreadcrumbContent title={title} />
        </BreadcrumbPage>
      ) : !href ? (
        <span className="text-muted-foreground text-xs">
          <BreadcrumbContent title={title} />
        </span>
      ) : (
        <BreadcrumbLink asChild className="text-xs">
          <Link to={href} aria-label={title === "home" ? t("home") : undefined}>
            <BreadcrumbContent title={title} />
          </Link>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  );
}

/**
 * Router-aware breadcrumb component that automatically generates breadcrumbs
 * based on the current route metadata and provides a navigation trail.
 *
 * The component now supports automatic breadcrumb generation from route metadata,
 * eliminating the need for manual intermediate sections in most cases.
 *
 * @param customSegments - Optional array of custom breadcrumb segments to override auto-generation
 * @returns A breadcrumb navigation component
 *
 * @example
 * ```tsx
 * // Auto-generated breadcrumbs based on route metadata
 * <RouterBreadcrumb />
 *
 * // Custom breadcrumbs (rarely needed)
 * <RouterBreadcrumb
 *   customSegments={[
 *     { title: "Home", href: "/" },
 *     { title: "Products", href: "/products" },
 *     { title: "Product Details", isCurrentPage: true }
 *   ]}
 * />
 * ```
 */
interface BreadcrumbSegmentWithMetadata {
  segment: BreadcrumbSegment;
  metadata?: BreadcrumbMetadata;
}

export function RouterBreadcrumb({
  customSegments,
}: {
  customSegments?: BreadcrumbSegment[];
}) {
  const routerState = useRouterState();

  // Generate breadcrumb segments from router state
  const generateSegmentsWithMetadata = (): BreadcrumbSegmentWithMetadata[] => {
    if (customSegments) {
      return customSegments.map((seg) => ({ segment: seg }));
    }

    const segmentsWithMeta: BreadcrumbSegmentWithMetadata[] = [];

    // Always start with home
    segmentsWithMeta.push({
      segment: {
        title: "home", // Special marker for home icon
        href: "/",
      },
    });

    // Find the deepest match with breadcrumb data
    let breadcrumbsFromLoader: BreadcrumbMetadata[] | undefined;
    for (let i = routerState.matches.length - 1; i >= 0; i--) {
      const match = routerState.matches[i];
      if (!match) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loaderData = match.loaderData as any;
      if (loaderData?.breadcrumb && Array.isArray(loaderData.breadcrumb)) {
        breadcrumbsFromLoader = loaderData.breadcrumb;
        break;
      }
    }

    // If we have breadcrumb array from loader, use it
    if (breadcrumbsFromLoader) {
      // Filter out hidden items first
      const visibleBreadcrumbs = breadcrumbsFromLoader.filter(
        (meta) => !meta.hidden
      );

      visibleBreadcrumbs.forEach((breadcrumbMeta, index) => {
        const isLast = index === visibleBreadcrumbs.length - 1;

        // Add segment with metadata
        segmentsWithMeta.push({
          segment: {
            title: breadcrumbMeta.title,
            href: isLast ? undefined : breadcrumbMeta.href,
            isCurrentPage: isLast,
          },
          metadata: breadcrumbMeta,
        });
      });
    } else {
      // Fallback to building from route matches
      // First, collect all visible matches
      const visibleMatches = routerState.matches.filter((match) => {
        // Skip layout routes (those with underscore prefix)
        if (match.id.startsWith("/_") || match.id === "/") {
          return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loaderData = match.loaderData as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = match.context as any;
        const breadcrumbMeta = loaderData?.breadcrumb ?? context?.breadcrumb;

        // Skip if marked as hidden
        if (breadcrumbMeta?.hidden) {
          return false;
        }

        return true;
      });

      visibleMatches.forEach((match, index) => {
        const isLast = index === visibleMatches.length - 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loaderData = match.loaderData as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = match.context as any;

        // Extract breadcrumb metadata from various sources
        const breadcrumbMeta: BreadcrumbMetadata | undefined =
          loaderData?.breadcrumb ?? context?.breadcrumb;

        // Determine fallback title
        let fallbackTitle = "";
        if (loaderData?.factory?.name) {
          fallbackTitle = loaderData.factory.name;
        } else if (loaderData?.token?.name) {
          fallbackTitle = loaderData.token.name;
        } else {
          // Extract from route ID or path
          const routePart =
            match.pathname.split("/").filter(Boolean).pop() ?? "";

          // Handle ethereum addresses
          if (routePart.startsWith("0x") && routePart.length === 42) {
            fallbackTitle = `${routePart.slice(0, 6)}...${routePart.slice(-4)}`;
          } else if (routePart && !routePart.startsWith("$")) {
            // Capitalize first letter of route segment
            fallbackTitle =
              routePart.charAt(0).toUpperCase() + routePart.slice(1);
          }
        }

        // Add segment with metadata
        segmentsWithMeta.push({
          segment: {
            title: breadcrumbMeta?.title ?? (fallbackTitle || "..."),
            href: isLast ? undefined : match.pathname,
            isCurrentPage: isLast,
          },
          metadata: breadcrumbMeta,
        });
      });
    }

    return segmentsWithMeta;
  };

  const segmentsWithMeta = generateSegmentsWithMetadata();

  // Don't render breadcrumbs if we only have home
  if (segmentsWithMeta.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segmentsWithMeta.map((item, index) => {
          const isLast = index === segmentsWithMeta.length - 1;
          const { segment, metadata } = item;
          // Use metadata href if available, otherwise fall back to segment href
          const href = metadata?.href ?? segment.href;

          return (
            <Fragment key={href ?? segment.title}>
              <BreadcrumbItemRender
                breadcrumbMeta={metadata}
                fallbackTitle={segment.title}
                href={href}
                isCurrentPage={segment.isCurrentPage}
              />
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
