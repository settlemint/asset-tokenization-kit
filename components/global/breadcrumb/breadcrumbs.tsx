"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";
import { type BreadcrumbItemType, EllipsisDropdown } from "./ellipsis-dropdown";

interface ProcessedBreadcrumbItems {
  visibleItems: (BreadcrumbItemType | null)[];
  collapsedItems: BreadcrumbItemType[];
}

/**
 * Processes breadcrumb items to determine which should be visible and which should be collapsed.
 * @param items - The array of breadcrumb items to process.
 * @returns An object containing visible items and collapsed items.
 */
function procesBreadcrumbItems(items: BreadcrumbItemType[]): ProcessedBreadcrumbItems {
  if (items.length <= 3) {
    return { visibleItems: items, collapsedItems: [] };
  }

  return {
    visibleItems: [
      items[0],
      null, // placeholder for ellipsis
      ...items.slice(-2),
    ],
    collapsedItems: items.slice(1, -2),
  };
}

/**
 * Renders a single breadcrumb item.
 * @param item - The breadcrumb item to render.
 * @param collapsedItems - The array of collapsed items (used for the ellipsis dropdown).
 * @returns The rendered breadcrumb item.
 */
function renderBreadcrumbItem(item: BreadcrumbItemType | null, collapsedItems: BreadcrumbItemType[]) {
  if (item === null) {
    return <EllipsisDropdown items={collapsedItems} />;
  }

  if (item.href) {
    return (
      <BreadcrumbLink asChild>
        <Link href={item.href}>{item.label}</Link>
      </BreadcrumbLink>
    );
  }

  return <BreadcrumbPage>{item.label}</BreadcrumbPage>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemType[];
}

/**
 * Renders a breadcrumb component with collapsible items.
 * @param props - The component props.
 * @returns The rendered Breadcrumb component.
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname(); // Gets the current path

  const breadcrumbPrefix = items[0];
  const breadcrumbItems = [breadcrumbPrefix].concat(items.slice(1).find((item) => item.href === pathname) ?? []);

  const { visibleItems, collapsedItems } = useMemo(() => procesBreadcrumbItems(breadcrumbItems), [breadcrumbItems]);

  const visibleBreadcrumbs = visibleItems.map((item, i) => {
    if (i === visibleItems.length - 1 && item?.href) {
      return { label: item.label };
    }
    return item;
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleBreadcrumbs.map((item, index) => {
          return (
            <Fragment key={item ? item.label : `ellipsis-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>{renderBreadcrumbItem(item, collapsedItems)}</BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
