"use client";

import type { ColumnMeta } from "@tanstack/react-table";

export function PropertyFilterSubject<TData>({
  meta,
}: {
  meta: ColumnMeta<TData, string>;
}) {
  const Icon = meta.icon;

  return (
    <span className="flex select-none items-center gap-1 whitespace-nowrap px-2 font-medium text-xs">
      {Icon && <Icon className="size-3.5 stroke-[2.25px]" />}
      <span>{meta.displayName ?? "Filter"}</span>
    </span>
  );
}
