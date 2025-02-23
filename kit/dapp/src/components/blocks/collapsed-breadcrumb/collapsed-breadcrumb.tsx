'use client';

import { EllipsisDropdown } from '@/components/blocks/collapsed-breadcrumb/collapsed-breadcrumb-ellipsis';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

interface BreadcrumbsProps {
  maxVisibleItems?: number;
  className?: string;
  hideRoot?: boolean;
}

interface BreadcrumbItemBase {
  label: string;
  href?: string;
}

type BreadcrumbItemType =
  | BreadcrumbItemBase
  | (BreadcrumbItemBase & { items: BreadcrumbItemBase[] });

function BreadcrumbItemContent({ item }: { item: BreadcrumbItemType }) {
  if ('items' in item) {
    return <EllipsisDropdown items={item.items} />;
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

const SPLITTER = /[-_]/;

export default function CollapsedBreadcrumbs({
  maxVisibleItems = 3,
  hideRoot = false,
  className,
}: BreadcrumbsProps) {
  const _maxVisibleItems = maxVisibleItems + (hideRoot ? 1 : 0);
  const pathname = usePathname();
  const routeSegments = pathname.split('/').filter(Boolean).slice(0, -1);

  if (!routeSegments.length) {
    return null;
  }

  const items = routeSegments.map((route, index) => ({
    label: route
      .split(SPLITTER)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
    href: `/${routeSegments.slice(0, index + 1).join('/')}`,
  }));

  const visibleItems =
    items.length <= _maxVisibleItems
      ? items
      : [
          items[0],
          { label: '...', items: items.slice(1, -_maxVisibleItems + 1) },
          ...items.slice(-_maxVisibleItems + 1),
        ];

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {visibleItems
          .filter((item) => {
            if (hideRoot) {
              return item !== items[0];
            }
            return true;
          })
          .map((item, index) => (
            <Fragment key={item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbItemContent item={item} />
              </BreadcrumbItem>
            </Fragment>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
