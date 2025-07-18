import type { ColumnMeta } from "@tanstack/react-table";

/**
 * Displays the subject (column name) of a filter with an optional icon.
 * This component is used in filter chips to show which column is being filtered.
 *
 * @param props - Component props
 * @param props.meta - Column metadata containing display name and icon
 * @returns A span element with the column icon and display name
 *
 * @example
 * ```tsx
 * <PropertyFilterSubject
 *   meta={{
 *     displayName: 'Status',
 *     icon: StatusIcon
 *   }}
 * />
 * // Renders: <span><StatusIcon /> Status</span>
 * ```
 */
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
