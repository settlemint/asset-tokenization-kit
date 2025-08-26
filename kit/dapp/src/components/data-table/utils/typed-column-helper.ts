import type {
  AccessorFn,
  AccessorFnColumnDef,
  AccessorKeyColumnDef,
  ColumnHelper,
  IdentifiedColumnDef,
  RowData,
} from "@tanstack/react-table";
import { createColumnHelper as createTanstackColumnHelper } from "@tanstack/react-table";
import type { DeepKeys, DeepValue } from "@tanstack/react-table";

/**
 * Strict accessor column definition that excludes the cell property.
 * This ensures accessor columns are only used for data access, not rendering.
 */
type StrictAccessorColumnDef<TData extends RowData, TValue = unknown> = Omit<
  IdentifiedColumnDef<TData, TValue>,
  "cell"
>;

/**
 * Strict column helper type that enforces separation between data access and rendering.
 * - accessor: Only for data access, no custom cell rendering
 * - display: Only for custom rendering
 */
export interface StrictColumnHelper<TData extends RowData> {
  accessor: <
    TAccessor extends AccessorFn<TData> | DeepKeys<TData>,
    TValue extends TAccessor extends AccessorFn<TData, infer TReturn>
      ? TReturn
      : TAccessor extends DeepKeys<TData>
        ? DeepValue<TData, TAccessor>
        : never,
  >(
    accessor: TAccessor,
    column: StrictAccessorColumnDef<TData, TValue>
  ) => TAccessor extends AccessorFn<TData>
    ? AccessorFnColumnDef<TData, TValue>
    : AccessorKeyColumnDef<TData, TValue>;
  display: ColumnHelper<TData>["display"];
  group: ColumnHelper<TData>["group"];
}

/**
 * Creates a strict column helper that enforces proper separation of concerns:
 * - Use `accessor` for data columns that need automatic formatting
 * - Use `display` for custom cell rendering
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
 * // ✅ Good - accessor with processed value (no custom display needed)
 * columnHelper.accessor((row) => formatEventName(row.eventName), {
 *   id: "event",
 *   header: "Event Name",
 *   meta: { type: "text" }
 * })
 *
 * // ✅ Good - accessor with computed value
 * columnHelper.accessor((row) => row.firstName + " " + row.lastName, {
 *   id: "fullName",
 *   header: "Full Name",
 *   meta: { type: "text" }
 * })
 *
 * // ✅ Good - accessor with prettified text
 * columnHelper.accessor((row) => prettifyStatus(row.status), {
 *   id: "prettyStatus",
 *   header: "Status",
 *   meta: { type: "text" }
 * })
 *
 * // ✅ Good - accessor with mathematical transformation
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
 * // ✅ Good - display for custom rendering
 * columnHelper.display({
 *   id: "actions",
 *   cell: () => <ActionsCell />,
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
