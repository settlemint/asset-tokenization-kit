import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { getBreadcrumbItemsFromPath } from "fumadocs-core/breadcrumb";
import { useTreeContext, useTreePath } from "fumadocs-ui/contexts/tree";
import type { BreadcrumbProps } from "fumadocs-ui/layouts/docs/page";
import { Home } from "lucide-react";
import { Fragment, useMemo } from "react";

export function DocsBreadcrumb({
  includeRoot,
  includeSeparator,
  includePage,
  ...props
}: BreadcrumbProps) {
  const path = useTreePath();
  const { root } = useTreeContext();
  const items = useMemo(() => {
    return [
      { name: "home", url: "/" },
      ...getBreadcrumbItemsFromPath(root, path, {
        includePage,
        includeSeparator,
        includeRoot,
      }),
    ];
  }, [includePage, includeRoot, includeSeparator, path, root]);

  if (items.length === 0) return null;

  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItem className="text-xs">
                {isLast ? (
                  <BreadcrumbPage>
                    {item.name === "home" ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      item.name
                    )}
                  </BreadcrumbPage>
                ) : item.url ? (
                  <BreadcrumbLink asChild className="text-xs">
                    <Link
                      to={item.url}
                      aria-label={item.name === "home" ? "Home" : undefined}
                    >
                      {item.name === "home" ? (
                        <Home className="h-3 w-3" />
                      ) : (
                        item.name
                      )}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    {item.name === "home" ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      item.name
                    )}
                  </span>
                )}
              </BreadcrumbItem>
              {!isLast && includeSeparator && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
