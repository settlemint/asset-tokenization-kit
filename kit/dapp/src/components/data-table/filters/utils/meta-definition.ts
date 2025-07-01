import type { AccessorFn, ColumnMeta } from "@tanstack/react-table";
import type { ColumnDataType } from "../types/column-types";

export function defineMeta<
  TData,
  /* Only accessorFn - WORKS */
  TAccessor extends AccessorFn<TData>,
  TVal extends ReturnType<TAccessor>,
  /* Only accessorKey - WORKS */
  // TAccessor extends DeepKeys<TData>,
  // TVal extends DeepValue<TData, TAccessor>,

  /* Both accessorKey and accessorFn - BROKEN */
  /* ISSUE: Won't infer transformOptionFn input type correctly. */
  // TAccessor extends AccessorFn<TData> | DeepKeys<TData>,
  // TVal extends TAccessor extends AccessorFn<TData>
  // ? ReturnType<TAccessor>
  // : TAccessor extends DeepKeys<TData>
  // ? DeepValue<TData, TAccessor>
  // : never,
>(
  _accessor: TAccessor,
  meta: Omit<ColumnMeta<TData, TVal>, "type"> & {
    type: ColumnDataType;
  }
): ColumnMeta<TData, TVal> {
  return meta;
}
