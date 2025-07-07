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
  const { t } = useTranslation(["navigation"]);
  const [asyncTitle, setAsyncTitle] = useState<string | null>(null);

  useEffect(() => {
    if (breadcrumbMeta?.getTitle) {
      // Reset async title when getTitle changes
      setAsyncTitle(null);
      
      // Resolve the async title
      const resolveTitle = async () => {
        try {
          const title = await breadcrumbMeta.getTitle();
          setAsyncTitle(title);
        } catch (error) {
          // Fall back to static title or default on error
          setAsyncTitle(breadcrumbMeta.title || fallbackTitle);
        }
      };
      
      resolveTitle();
    }
  }, [breadcrumbMeta?.getTitle, breadcrumbMeta?.title, fallbackTitle]);

  // Determine the title to display
  if (breadcrumbMeta?.title) {
    // Handle i18n keys
    if (breadcrumbMeta.isI18nKey) {
      return t(breadcrumbMeta.title as any);
    }
    return breadcrumbMeta.title;
  }
  
  // If we have an async title function
  if (breadcrumbMeta?.getTitle) {
    // Return the resolved title or a placeholder while loading
    return asyncTitle ?? "...";
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
  const { t } = useTranslation(["navigation"]);
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
          <Link
            to={href}
            aria-label={title === "home" ? t("home") : undefined}
          >
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
  const { t } = useTranslation(["navigation"]);
  const routerState = useRouterState();

  // Generate breadcrumb segments from router state
  const generateSegmentsWithMetadata = (): BreadcrumbSegmentWithMetadata[] => {
    if (customSegments) {
      return customSegments.map(seg => ({ segment: seg }));
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
      const loaderData = match.loaderData as any;
      if (loaderData?.breadcrumb && Array.isArray(loaderData.breadcrumb)) {
        breadcrumbsFromLoader = loaderData.breadcrumb;
        break;
      }
    }

    // If we have breadcrumb array from loader, use it
    if (breadcrumbsFromLoader) {
      breadcrumbsFromLoader.forEach((breadcrumbMeta, index) => {
        const isLast = index === breadcrumbsFromLoader.length - 1;
        
        // Skip if marked as hidden
        if (breadcrumbMeta.hidden) {
          return;
        }

        // Add segment with metadata
        segmentsWithMeta.push({
          segment: {
            title: breadcrumbMeta.title || "...",
            href: isLast ? undefined : breadcrumbMeta.href,
            isCurrentPage: isLast,
          },
          metadata: breadcrumbMeta,
        });
      });
    } else {
      // Fallback to building from route matches
      routerState.matches.forEach((match, index) => {
        // Skip layout routes (those with underscore prefix)
        if (match.id.startsWith("/_") || match.id === "/") {
          return;
        }

        const isLast = index === routerState.matches.length - 1;
        const loaderData = match.loaderData as any;
        const context = match.context as any;

        // Extract breadcrumb metadata from various sources
        const breadcrumbMeta: BreadcrumbMetadata | undefined =
          loaderData?.breadcrumb || context?.breadcrumb;

        // Skip if marked as hidden
        if (breadcrumbMeta?.hidden) {
          return;
        }

        // Determine fallback title
        let fallbackTitle = "";
        if (loaderData?.factory?.name) {
          fallbackTitle = loaderData.factory.name;
        } else if (loaderData?.token?.name) {
          fallbackTitle = loaderData.token.name;
        } else {
          // Extract from route ID or path
          const routePart = match.pathname.split("/").filter(Boolean).pop() || "";
          
          // Handle ethereum addresses
          if (routePart.startsWith("0x") && routePart.length === 42) {
            fallbackTitle = `${routePart.slice(0, 6)}...${routePart.slice(-4)}`;
          } else if (routePart && !routePart.startsWith("$")) {
            // Capitalize first letter of route segment
            fallbackTitle = routePart.charAt(0).toUpperCase() + routePart.slice(1);
          }
        }

        // Add segment with metadata
        segmentsWithMeta.push({
          segment: {
            title: breadcrumbMeta?.title || fallbackTitle || "...",
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
