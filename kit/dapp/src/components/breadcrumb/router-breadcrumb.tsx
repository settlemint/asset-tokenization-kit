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
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BreadcrumbMetadata } from "./metadata";

interface BreadcrumbSegment {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

// Type for loader data that may contain breadcrumb info
interface LoaderDataWithBreadcrumb {
  breadcrumb?: BreadcrumbMetadata | BreadcrumbMetadata[];
  factory?: { name: string };
  token?: { name: string };
}

/**
 * Hook to handle async breadcrumb titles
 */
function useAsyncBreadcrumbTitle(
  breadcrumbMeta: BreadcrumbMetadata | undefined,
  fallbackTitle: string
): string {
  const namespace = breadcrumbMeta?.i18nNamespace ?? "navigation";
  const { i18n } = useTranslation([namespace]);
  const [asyncTitle, setAsyncTitle] = useState<string | null>(null);

  // Create a stable key for the breadcrumb to track changes
  const breadcrumbKey = breadcrumbMeta
    ? `${breadcrumbMeta.title}-${String(breadcrumbMeta.isI18nKey ?? false)}-${breadcrumbMeta.i18nNamespace ?? ""}`
    : null;

  useEffect(() => {
    let cancelled = false;
    const getTitle = breadcrumbMeta?.getTitle;
    if (getTitle) {
      // Reset async title when starting new resolution
      setAsyncTitle(null);

      // Resolve the async title
      const resolveTitle = async () => {
        try {
          const title = await getTitle();
          if (!cancelled) {
            setAsyncTitle(title);
          }
        } catch {
          // Fall back to static title or default on error
          if (!cancelled) {
            setAsyncTitle(breadcrumbMeta.title);
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
      // Use the i18n instance directly for dynamic keys to avoid TypeScript issues
      // i18next handles unknown keys gracefully by returning the key itself
      // We need to bypass TypeScript's strict typing for dynamic translation keys
      const key = `${namespace}:${breadcrumbMeta.title}`;
      const translatedTitle = (i18n.t as (key: string) => string)(key);
      return translatedTitle;
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
  const { t } = useTranslation(["navigation"]);
  const title = useAsyncBreadcrumbTitle(breadcrumbMeta, fallbackTitle);

  return (
    <BreadcrumbItem className="text-xs">
      {isCurrentPage ? (
        <BreadcrumbPage>
          {title === "home" ? <Home className="h-3 w-3" /> : title}
        </BreadcrumbPage>
      ) : href ? (
        <BreadcrumbLink asChild className="text-xs">
          <Link to={href} aria-label={title === "home" ? t("home") : undefined}>
            {title === "home" ? <Home className="h-3 w-3" /> : title}
          </Link>
        </BreadcrumbLink>
      ) : (
        <span className="text-muted-foreground text-xs">
          {title === "home" ? <Home className="h-3 w-3" /> : title}
        </span>
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

/**
 * Helper function to extract breadcrumb metadata from loader data and context
 * @param loaderData - The loader data from the route match
 * @param context - The context from the route match
 * @returns The breadcrumb metadata if found, undefined otherwise
 */
function extractBreadcrumbMetadata(
  loaderData: LoaderDataWithBreadcrumb | undefined,
  context: { breadcrumb?: BreadcrumbMetadata } | undefined
): BreadcrumbMetadata | undefined {
  return (
    (loaderData?.breadcrumb && !Array.isArray(loaderData.breadcrumb)
      ? loaderData.breadcrumb
      : undefined) ?? context?.breadcrumb
  );
}

export function RouterBreadcrumb({
  customSegments,
}: {
  customSegments?: BreadcrumbSegment[];
}) {
  const matches = useRouterState({
    select: (state) => state.matches,
  });

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
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      if (!match) continue;
      const loaderData = match.loaderData as
        | LoaderDataWithBreadcrumb
        | undefined;
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
      const visibleMatches = matches.filter((match) => {
        // Skip layout routes (those with underscore prefix)
        if (match.id.startsWith("/_") || match.id === "/") {
          return false;
        }

        const loaderData = match.loaderData as
          | LoaderDataWithBreadcrumb
          | undefined;
        const context = match.context as
          | { breadcrumb?: BreadcrumbMetadata }
          | undefined;
        const breadcrumbMeta = extractBreadcrumbMetadata(loaderData, context);

        // Skip if marked as hidden
        if (breadcrumbMeta?.hidden) {
          return false;
        }

        return true;
      });

      visibleMatches.forEach((match, index) => {
        const isLast = index === visibleMatches.length - 1;
        const loaderData = match.loaderData as
          | LoaderDataWithBreadcrumb
          | undefined;
        const context = match.context as
          | { breadcrumb?: BreadcrumbMetadata }
          | undefined;

        // Extract breadcrumb metadata from various sources
        const breadcrumbMeta = extractBreadcrumbMetadata(loaderData, context);

        // Determine fallback title
        let fallbackTitle = "";
        if (loaderData?.factory?.name) {
          fallbackTitle = loaderData.factory.name;
        } else if (loaderData?.token?.name) {
          fallbackTitle = loaderData.token.name;
        } else {
          // Extract from route ID or path
          const pathSegments = match.pathname.split("/").filter(Boolean);
          const routePart = pathSegments.at(-1) ?? "";

          // Handle ethereum addresses
          if (routePart.startsWith("0x") && routePart.length === 42) {
            fallbackTitle = `${routePart.slice(0, 6)}...${routePart.slice(-4)}`;
          } else if (routePart && !routePart.startsWith("$")) {
            // Capitalize first letter of route segment
            fallbackTitle =
              String(routePart.charAt(0)).toUpperCase() +
              String(routePart.slice(1));
          }
        }

        // Add segment with metadata
        segmentsWithMeta.push({
          segment: {
            title: breadcrumbMeta?.title ?? fallbackTitle,
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
