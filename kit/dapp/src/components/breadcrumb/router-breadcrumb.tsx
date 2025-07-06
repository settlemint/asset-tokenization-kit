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
import { useTranslation } from "react-i18next";

interface BreadcrumbSegment {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

/**
 * Router-aware breadcrumb component that automatically generates breadcrumbs
 * based on the current route and provides a navigation trail.
 *
 * @param customSegments - Optional array of custom breadcrumb segments to override auto-generation
 * @param intermediateSections - Optional array of sections to insert between home and auto-detected segments
 * @returns A breadcrumb navigation component
 *
 * @example
 * ```tsx
 * // Auto-generated breadcrumbs based on route
 * <RouterBreadcrumb />
 *
 * // With intermediate sections
 * <RouterBreadcrumb
 *   intermediateSections={[
 *     { title: "Asset Management", href: "/assets" },
 *     { title: "Fixed Income" } // No href means not clickable
 *   ]}
 * />
 *
 * // Custom breadcrumbs
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
  intermediateSections = [],
}: {
  customSegments?: BreadcrumbSegment[];
  intermediateSections?: BreadcrumbSegment[];
}) {
  const { t } = useTranslation("general");
  const routerState = useRouterState();

  // Generate breadcrumb segments from router state
  const generateSegments = (): BreadcrumbSegment[] => {
    if (customSegments) {
      return customSegments;
    }

    const segments: BreadcrumbSegment[] = [];
    const currentPath = routerState.location.pathname;
    const pathParts = currentPath.split("/").filter(Boolean);

    // Always start with home
    segments.push({
      title: "home", // Special marker for home icon
      href: "/",
    });

    // Add intermediate sections after home
    intermediateSections.forEach((section) => {
      segments.push({
        title: section.title,
        href: section.href,
        isCurrentPage: false,
      });
    });

    // Build breadcrumb segments from path
    let accumulatedPath = "";
    pathParts.forEach((part, index) => {
      accumulatedPath += `/${part}`;
      const isLast = index === pathParts.length - 1;

      // Skip private/onboarded segments as they're not user-facing
      if (
        part === "_private" ||
        part === "_onboarded" ||
        part === "token" ||
        part === "stats"
      ) {
        return;
      }

      // Get title from route data or format the path part
      let title = part;

      // Check if this is a dynamic segment (e.g., factory address)
      const currentMatch = routerState.matches[routerState.matches.length - 1];
      if (currentMatch?.params && Object.keys(currentMatch.params).length > 0) {
        // For factory routes, try to get the factory name from loader data
        const loaderData = currentMatch.loaderData as {
          factory?: { name?: string };
        };
        if (loaderData.factory?.name) {
          title = loaderData.factory.name;
        } else {
          // Fallback to shortening addresses
          if (part.startsWith("0x") && part.length === 42) {
            title = `${part.slice(0, 6)}...${part.slice(-4)}`;
          }
        }
      }

      segments.push({
        title,
        href: isLast ? undefined : accumulatedPath,
        isCurrentPage: isLast,
      });
    });

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
                        segment.title === "home"
                          ? t("navigation.home")
                          : undefined
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
