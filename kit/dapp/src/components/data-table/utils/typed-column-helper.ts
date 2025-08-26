import type {
  AccessorFnColumnDef,
  AccessorKeyColumnDef,
  ColumnHelper,
  DeepKeys,
  DeepValue,
  IdentifiedColumnDef,
  RowData,
} from "@tanstack/react-table";
import { createColumnHelper as createTanstackColumnHelper } from "@tanstack/react-table";

/**
 * Strict accessor column definition that excludes the cell property.
 * This ensures accessor columns are only used for data access, not rendering.
 */
type StrictAccessorColumnDef<TData extends RowData, TValue = unknown> = Omit<
  IdentifiedColumnDef<TData, TValue>,
  "cell"
>;

/**
 * Primitive types allowed as return values from accessor functions
 */
type PrimitiveType = string | number | boolean | null | undefined;

/**
 * Strict accessor function type that only allows primitive return types
 */
type StrictAccessorFn<TData extends RowData> = (
  row: TData,
  index: number
) => PrimitiveType;

/**
 * Strict column helper type that enforces separation between data access and rendering.
 * - accessor: Only for data access, no custom cell rendering, returns only primitive types
 * - display: Only for custom rendering
 */
export interface StrictColumnHelper<TData extends RowData> {
  accessor: <
    TAccessor extends StrictAccessorFn<TData> | DeepKeys<TData>,
    TValue extends TAccessor extends StrictAccessorFn<TData>
      ? ReturnType<TAccessor>
      : TAccessor extends DeepKeys<TData>
        ? DeepValue<TData, TAccessor>
        : never,
  >(
    accessor: TAccessor,
    column: StrictAccessorColumnDef<TData, TValue>
  ) => TAccessor extends StrictAccessorFn<TData>
    ? AccessorFnColumnDef<TData, TValue>
    : AccessorKeyColumnDef<TData, TValue>;
  display: ColumnHelper<TData>["display"];
  group: ColumnHelper<TData>["group"];
}

/**
 * Creates a strict column helper that enforces proper separation of concerns:
 * - Use `accessor` for data columns that return primitive types (string/number/boolean) only
 * - Use `display` for custom cell rendering with React components
 *
 * @example
 * ```tsx
 * const columnHelper = createStrictColumnHelper<MyData>();
 *
 * // ✅ Good - accessor for data with automatic formatting
 * columnHelper.accessor("amount", {
 *   header: "Amount",
 *   meta: { type: "currency" }
 * })
 *
 * // ✅ Good - accessor with processed string value (primitive return)
 * columnHelper.accessor((row) => formatEventName(row.eventName), {
 *   id: "event",
 *   header: "Event Name",
 *   meta: { type: "text" }
 * })
 *
 * // ✅ Good - accessor with computed string value
 * columnHelper.accessor((row) => row.firstName + " " + row.lastName, {
 *   id: "fullName",
 *   header: "Full Name",
 *   meta: { type: "text" }
 * })
 *
 * // ✅ Good - accessor with prettified string
 * columnHelper.accessor((row) => prettifyStatus(row.status), {
 *   id: "prettyStatus",
 *   header: "Status",
 *   meta: { type: "text" }
 * })
 *
 * // ✅ Good - accessor with mathematical transformation (number return)
 * columnHelper.accessor((row) => row.valueInWei / 1e18, {
 *   id: "valueInEth",
 *   header: "Value (ETH)",
 *   meta: { type: "currency", currency: { assetSymbol: "ETH" } }
 * })
 *
 * // ❌ Type Error - cell not allowed in accessor
 * columnHelper.accessor("amount", {
 *   header: "Amount",
 *   cell: () => <CustomCell /> // This will cause a type error
 * })
 *
 * // ❌ Type Error - accessor function cannot return React components
 * columnHelper.accessor((row) => <StatusBadge status={row.status} />, {
 *   id: "statusBadge",
 *   header: "Status" // This will cause a type error
 * })
 *
 * // ✅ Good - display for custom rendering with React components
 * columnHelper.display({
 *   id: "actions",
 *   cell: () => <ActionsCell />,
 *   meta: { type: "none" }
 * })
 *
 * // ✅ Good - display for status badges and custom components
 * columnHelper.display({
 *   id: "status",
 *   cell: ({ row }) => <StatusBadge status={row.original.status} />,
 *   meta: { type: "none" }
 * })
 * ```
 */
export function createStrictColumnHelper<
  TData extends RowData,
>(): StrictColumnHelper<TData> {
  const baseHelper = createTanstackColumnHelper<TData>();

  return {
    accessor: baseHelper.accessor as StrictColumnHelper<TData>["accessor"],
    display: baseHelper.display,
    group: baseHelper.group,
  };
}
