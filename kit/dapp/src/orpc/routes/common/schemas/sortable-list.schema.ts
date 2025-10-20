import * as z from "zod";

/**
 * Schema for sorting a list of items.
 *
 * This schema is used to sort a list of items by a given field.
 * The orderDirection determines whether the results should be sorted in ascending
 * or descending order.
 * The orderBy field determines which field should be used for ordering the results.
 *
 * @example
 * ```typescript
 * const input: SortableListInput = {
 *   orderDirection: "asc",
 *   orderBy: "createdAt",
 * };
 * ```
 */
export const SortableListSchema = z.object({
  /**
   * Sort order direction for the results.
   *
   * Determines whether the results should be sorted in ascending
   * or descending order when combined with the orderBy field.
   *
   * Defaults to ascending order.
   */
  orderDirection: z.enum(["asc", "desc"]).default("asc"),

  /**
   * Field name to sort the results by.
   *
   * Specifies which field should be used for ordering the results.
   * The actual available fields depend on the specific entity being queried.
   *
   * Defaults to ordering by id.
   */
  orderBy: z.string().default("id"),
});

// Type export for use in handlers and utilities
export type SortableListInput = z.infer<typeof SortableListSchema>;
