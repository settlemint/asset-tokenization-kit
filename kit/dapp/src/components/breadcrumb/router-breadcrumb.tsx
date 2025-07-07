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
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

interface BreadcrumbSegment {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
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
export function RouterBreadcrumb({
  customSegments,
}: {
  customSegments?: BreadcrumbSegment[];
}) {
  const { t } = useTranslation(["navigation"]);
  const routerState = useRouterState();

  // Generate breadcrumb segments from router state
  const generateSegments = (): BreadcrumbSegment[] => {
    if (customSegments) {
      return customSegments;
    }

    const segments: BreadcrumbSegment[] = [];

    // Always start with home
    segments.push({
      title: "home", // Special marker for home icon
      href: "/",
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

        // Determine the title
        let title = "";
        if (breadcrumbMeta.title) {
          // Handle i18n keys
          if (breadcrumbMeta.isI18nKey) {
            title = t(breadcrumbMeta.title as any);
          } else {
            title = breadcrumbMeta.title;
          }
        }

        // Only add segment if we have a title
        if (title) {
          segments.push({
            title,
            href: isLast ? undefined : "#", // We'd need to track URLs for intermediate segments
            isCurrentPage: isLast,
          });
        }
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

        // Determine the title
        let title = "";
        if (breadcrumbMeta?.title) {
          // Handle i18n keys
          if (breadcrumbMeta.isI18nKey) {
            title = t(breadcrumbMeta.title as any);
          } else {
            title = breadcrumbMeta.title;
          }
        } else if (breadcrumbMeta?.getTitle) {
          // For dynamic titles, we'll use the sync version or fallback
          title = "Loading..."; // This would need to be handled async
        } else {
          // Fallback to extracting from route or loader data
          if (loaderData?.factory?.name) {
            title = loaderData.factory.name;
          } else if (loaderData?.token?.name) {
            title = loaderData.token.name;
          } else {
            // Extract from route ID or path
            const routePart = match.pathname.split("/").filter(Boolean).pop() || "";
            
            // Handle ethereum addresses
            if (routePart.startsWith("0x") && routePart.length === 42) {
              title = `${routePart.slice(0, 6)}...${routePart.slice(-4)}`;
            } else if (routePart && !routePart.startsWith("$")) {
              // Capitalize first letter of route segment
              title = routePart.charAt(0).toUpperCase() + routePart.slice(1);
            }
          }
        }

        // Only add segment if we have a title
        if (title) {
          segments.push({
            title,
            href: isLast ? undefined : match.pathname,
            isCurrentPage: isLast,
          });
        }
      });
    }

    return segments;
  };

  const segments = generateSegments();

  // Don't render breadcrumbs if we only have home
  if (segments.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={segment.href ?? segment.title}>
              <BreadcrumbItem className="text-xs">
                {segment.isCurrentPage ? (
                  <BreadcrumbPage>
                    {segment.title === "home" ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      segment.title
                    )}
                  </BreadcrumbPage>
                ) : !segment.href ? (
                  // Non-clickable intermediate sections - use span with muted color
                  <span className="text-muted-foreground text-xs">
                    {segment.title === "home" ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      segment.title
                    )}
                  </span>
                ) : (
                  <BreadcrumbLink asChild className="text-xs">
                    <Link
                      to={segment.href}
                      aria-label={
                        segment.title === "home" ? t("home") : undefined
                      }
                    >
                      {segment.title === "home" ? (
                        <Home className="h-3 w-3" />
                      ) : (
                        segment.title
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
