import type { ListInput } from "@/orpc/routes/common/schemas/list.schema";
import type { TadaDocumentNode } from "gql.tada";

/**
 * Helper to create a filter object from optional input fields.
 * Only includes fields that are not undefined.
 *
 * @param fields - Object mapping field names to their values
 * @returns Filter object with only defined fields, or undefined if all fields are undefined
 *
 * @example
 * ```typescript
 * // Instead of:
 * filterBuilder: (input) => input.hasTokens !== undefined
 *   ? { hasTokens: input.hasTokens }
 *   : undefined
 *
 * // Use:
 * filterBuilder: (input) => buildFilter({ hasTokens: input.hasTokens })
 * ```
 */
export function buildFilter(
  fields: Record<string, unknown>
): Record<string, unknown> | undefined {
  const filter: Record<string, unknown> = {};
  let hasFields = false;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      filter[key] = value;
      hasFields = true;
    }
  }

  return hasFields ? filter : undefined;
}

/**
 * Transforms ListSchema input to TheGraph query variables.
 *
 * This utility converts our standard pagination parameters to TheGraph's
 * expected format, handling the mapping of offset/limit to skip/first
 * and ensuring proper typing for orderBy and orderDirection.
 *
 * It automatically handles additional filtering when a filterBuilder is provided.
 *
 * @param input - The validated input from ListSchema or an extended version
 * @param query - The GraphQL query document (used for type inference only)
 * @param options - Additional options for customization including filter builder
 * @returns TheGraph-compatible query variables typed for the specific query
 *
 * @example
 * ```typescript
 * // Simple pagination
 * const variables = toTheGraphVariables(input, MY_QUERY);
 *
 * // With filtering
 * const variables = toTheGraphVariables(input, MY_QUERY, {
 *   filterBuilder: (input) => input.hasTokens !== undefined
 *     ? { hasTokens: input.hasTokens }
 *     : undefined
 * });
 * ```
 */
export function toTheGraphVariables<
  TInput extends ListInput,
  TResult,
  TVariables,
>(
  input: TInput,
  query: TadaDocumentNode<TResult, TVariables>,
  options?: {
    /**
     * Default orderBy field if not provided in input.
     * TheGraph requires specific enum values for orderBy.
     */
    defaultOrderBy?: string;
    /**
     * Function to build the where clause from input.
     * If provided, enables filtering based on input fields.
     */
    filterBuilder?: (input: TInput) => Record<string, unknown> | undefined;
  }
): TVariables {
  const { defaultOrderBy, filterBuilder } = options ?? {};

  // Build base pagination variables
  const variables: Record<string, unknown> = {
    skip: input.offset,
    first: input.limit,
    orderDirection: input.orderDirection,
  };

  // Add orderBy if provided (TheGraph requires specific enum values)
  if (input.orderBy) {
    variables.orderBy = input.orderBy;
  } else if (defaultOrderBy) {
    variables.orderBy = defaultOrderBy;
  }

  // Add where clause if filterBuilder is provided
  if (filterBuilder) {
    const where = filterBuilder(input);
    if (where) {
      variables.where = where;
    }
  }

  // The query parameter is used only for type inference
  void query;

  return variables as TVariables;
}
