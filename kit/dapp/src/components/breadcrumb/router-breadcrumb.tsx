"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbMetadata } from "./metadata";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface BreadcrumbSegment {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

/**
 * Hook to handle async breadcrumb titles
 */
function useAsyncBreadcrumbTitle(
  breadcrumbMeta: BreadcrumbMetadata | undefined,
  fallbackTitle: string
): string {
  const namespace = breadcrumbMeta?.i18nNamespace ?? "navigation";
  const { t } = useTranslation([namespace]);
  const [asyncTitle, setAsyncTitle] = useState<string | null>(null);

  // Create a stable key for the breadcrumb to track changes
  const breadcrumbKey = breadcrumbMeta
    ? `${breadcrumbMeta.title}-${breadcrumbMeta.isI18nKey}-${breadcrumbMeta.i18nNamespace}`
    : null;

  useEffect(() => {
    let cancelled = false;

    if (breadcrumbMeta?.getTitle) {
      // Reset async title when starting new resolution
      setAsyncTitle(null);

      // Resolve the async title
      const resolveTitle = async () => {
        try {
          const title = await breadcrumbMeta.getTitle!();
          if (!cancelled) {
            setAsyncTitle(title);
          }
        } catch {
          // Fall back to static title or default on error
          if (!cancelled) {
            setAsyncTitle(breadcrumbMeta.title ?? fallbackTitle);
          }
        }
      };

      void resolveTitle();
    }

    return () => {
      cancelled = true;
    };
  }, [breadcrumbKey, fallbackTitle, breadcrumbMeta]);

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

  // If we have an async title function
  if (breadcrumbMeta?.getTitle && asyncTitle !== null) {
    return asyncTitle;
  }

  // Show ellipsis while loading async title
  if (breadcrumbMeta?.getTitle) {
    return "...";
  }

  return fallbackTitle;
}

/**
 * Component for rendering a single breadcrumb item with async title support
 */
function BreadcrumbItemWithAsyncTitle({
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
  const title = useAsyncBreadcrumbTitle(breadcrumbMeta, fallbackTitle);

  return (
    <BreadcrumbItem className="text-xs">
      {isCurrentPage ? (
        <BreadcrumbPage>
          {title === "home" ? <Home className="h-3 w-3" /> : title}
        </BreadcrumbPage>
      ) : !href ? (
        <span className="text-muted-foreground text-xs">
          {title === "home" ? <Home className="h-3 w-3" /> : title}
        </span>
      ) : (
        <BreadcrumbLink asChild className="text-xs">
          <Link to={href} aria-label={title === "home" ? "Home" : undefined}>
            {title === "home" ? <Home className="h-3 w-3" /> : title}
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
            title: breadcrumbMeta.title ?? "...",
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
            title: breadcrumbMeta?.title ?? fallbackTitle ?? "...",
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
            <Fragment key={href ?? segment.title ?? index}>
              <BreadcrumbItemWithAsyncTitle
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
