/**
 * TheGraph Middleware Module
 *
 * Provides advanced GraphQL querying capabilities with automatic pagination,
 * variable filtering, and schema validation for TheGraph queries.
 *
 * Key Features:
 * - Automatic pagination for list fields
 * - Merge and filtering of complex GraphQL responses
 * - Integration with Zod for runtime type validation
 *
 * @module TheGraphMiddleware
 * @category Middleware
 */
import { theGraphClient } from "@/lib/settlemint/the-graph";
import { sortBy } from "es-toolkit";
import { get, isArray, isEmpty, set } from "es-toolkit/compat";
import type { TadaDocumentNode } from "gql.tada";
import {
  ArgumentNode,
  DocumentNode,
  Kind,
  SelectionNode,
  visit,
} from "graphql";
import { ClientError, type Variables } from "graphql-request";
import { z } from "zod";
import { baseRouter } from "../../procedures/base.router";

// Constants for TheGraph limits
const THE_GRAPH_LIMIT = 500;
const FIRST_ARG = "first";
const SKIP_ARG = "skip";

interface ListField {
  path: string[];
  fieldName: string;
  alias?: string;
  hasFirstArg: boolean;
  firstValue?: number;
  skipValue?: number;
  otherArgs: ArgumentNode[];
  selections?: ReadonlyArray<SelectionNode>;
}

/**
 * Custom merge function for deep object merging with special handling for lists
 *
 * @param {unknown} target - The target object or value to merge into
 * @param {unknown} source - The source object or value to merge from
 * @returns {unknown} Merged result with preservation of arrays and specific merge logic
 *
 * @remarks
 * Key behaviors:
 * - Preserves existing arrays without merging
 * - Handles null and undefined values
 * - Performs deep merge for nested objects
 * - Prioritizes source values for primitives
 *
 * @example
 * // Returns [1, 2, 3]
 * customMerge([1], [2, 3])
 *
 * @example
 * // Returns { a: 2, b: { c: 3 } }
 * customMerge({ a: 1, b: { c: 2 } }, { a: 2, b: { c: 3 } })
 */
function customMerge(target: unknown, source: unknown): unknown {
  if (source == null) return target;
  if (target == null) return source;

  // Preserve existing arrays (paginated data) - don't merge them
  if (isArray(target) || isArray(source)) {
    return target;
  }

  if (typeof target !== "object" || typeof source !== "object") {
    return source;
  }

  // Manually merge objects to ensure arrays are preserved
  const targetObj = target as Record<string, unknown>;
  const sourceObj = source as Record<string, unknown>;
  const result: Record<string, unknown> = { ...targetObj };

  for (const key in sourceObj) {
    if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
      result[key] =
        key in result
          ? customMerge(result[key], sourceObj[key])
          : sourceObj[key];
    }
  }

  return result;
}

/**
 * Creates a validated TheGraph client with advanced querying capabilities
 *
 * @param {Object} errors - Error handling configuration from the base router
 * @returns {Object} A client with a query method that supports pagination, merging, and validation
 *
 * @description
 * Provides a robust GraphQL client that:
 * - Automatically handles pagination for list fields
 * - Merges complex nested query results
 * - Validates responses against Zod schemas
 * - Filters and preserves GraphQL variables
 *
 * @category Factory
 * @example
 * // Using the client to query with automatic pagination
 * const result = await client.query(TOKENS_QUERY, {
 *   input: { where: { type: 'ERC20' } },
 *   output: TokenSchema
 * });
 */
function createValidatedTheGraphClient(
  errors: Parameters<Parameters<typeof baseRouter.middleware>[0]>[0]["errors"]
) {
  // Extract all list fields (queries that have pagination arguments)
  function extractListFields(
    document: DocumentNode,
    variables?: Variables
  ): ListField[] {
    const fields: ListField[] = [];
    const pathStack: string[] = [];

    visit(document, {
      Field: {
        enter: (node) => {
          const fieldIdentifier = node.alias?.value || node.name.value;
          pathStack.push(fieldIdentifier);

          // Skip meta fields
          if (node.name.value.startsWith("__")) {
            return;
          }

          // Check if this field has pagination arguments (first or skip)
          let hasFirstArg = false;
          let hasSkipArg = false;
          let firstValue: number | undefined;
          let skipValue: number | undefined;
          const otherArgs: ArgumentNode[] = [];

          if (node.arguments) {
            for (const arg of node.arguments) {
              if (arg.name.value === FIRST_ARG) {
                hasFirstArg = true;
                if (arg.value.kind === Kind.INT) {
                  firstValue = Number.parseInt(arg.value.value);
                } else if (arg.value.kind === Kind.VARIABLE && variables) {
                  const varValue = (variables as Record<string, unknown>)[
                    arg.value.name.value
                  ];
                  firstValue =
                    typeof varValue === "number" ? varValue : undefined;
                }
              } else if (arg.name.value === SKIP_ARG) {
                hasSkipArg = true;
                if (arg.value.kind === Kind.INT) {
                  skipValue = Number.parseInt(arg.value.value);
                } else if (arg.value.kind === Kind.VARIABLE && variables) {
                  const varValue = (variables as Record<string, unknown>)[
                    arg.value.name.value
                  ];
                  skipValue =
                    typeof varValue === "number" ? varValue : undefined;
                }
              } else {
                otherArgs.push(arg);
              }
            }
          }

          // Consider it a list field ONLY if it has pagination arguments (first/skip)
          // This is the most reliable way to detect list fields in TheGraph
          const hasPaginationArgs = hasFirstArg || hasSkipArg;

          if (hasPaginationArgs) {
            fields.push({
              path: [...pathStack],
              fieldName: node.name.value,
              alias: node.alias?.value,
              hasFirstArg,
              firstValue,
              skipValue,
              otherArgs,
              selections: node.selectionSet?.selections,
            });
          }
        },
        leave: () => {
          pathStack.pop();
        },
      },
    });

    return fields;
  }

  // Create a query for a single field with specific pagination
  function createSingleFieldQuery(
    document: DocumentNode,
    targetField: ListField,
    skip: number,
    first: number
  ): DocumentNode {
    const targetPath = [...targetField.path];
    const pathStack: string[] = [];

    return visit(document, {
      Field: {
        enter: (node) => {
          const fieldIdentifier = node.alias?.value || node.name.value;
          pathStack.push(fieldIdentifier);

          // Check if we're on the path to target field
          const onPath = pathStack.every(
            (segment, i) => i >= targetPath.length || segment === targetPath[i]
          );

          if (!onPath) {
            pathStack.pop();
            return null; // Remove fields not on path
          }

          // If this is our target field, update pagination
          const isTarget =
            pathStack.length === targetPath.length &&
            pathStack.every((segment, i) => segment === targetPath[i]);

          if (isTarget) {
            const newArgs: ArgumentNode[] = [...targetField.otherArgs];

            // Add pagination arguments
            newArgs.push(
              {
                kind: Kind.ARGUMENT,
                name: { kind: Kind.NAME, value: FIRST_ARG },
                value: { kind: Kind.INT, value: first.toString() },
              },
              {
                kind: Kind.ARGUMENT,
                name: { kind: Kind.NAME, value: SKIP_ARG },
                value: { kind: Kind.INT, value: skip.toString() },
              }
            );

            // Add orderBy if not present to ensure stable pagination
            let hasOrderBy = false;
            let hasOrderDirection = false;

            for (const arg of newArgs) {
              if (arg.name.value === "orderBy") hasOrderBy = true;
              if (arg.name.value === "orderDirection") hasOrderDirection = true;
            }

            if (!hasOrderBy) {
              newArgs.push({
                kind: Kind.ARGUMENT,
                name: { kind: Kind.NAME, value: "orderBy" },
                value: { kind: Kind.STRING, value: "id" },
              });
            }

            if (!hasOrderDirection) {
              newArgs.push({
                kind: Kind.ARGUMENT,
                name: { kind: Kind.NAME, value: "orderDirection" },
                value: { kind: Kind.STRING, value: "asc" },
              });
            }

            return { ...node, arguments: newArgs };
          }

          return undefined;
        },
        leave: () => {
          pathStack.pop();
        },
      },
    });
  }

  // Create query without list fields
  function createNonListQuery(
    document: DocumentNode,
    listFields: ListField[]
  ): DocumentNode | null {
    let hasFields = false;
    const pathStack: string[] = [];

    const filtered = visit(document, {
      Field: {
        enter: (node) => {
          const fieldIdentifier = node.alias?.value || node.name.value;
          pathStack.push(fieldIdentifier);

          // Check if this field is a list field
          const isList = listFields.some(
            (field) =>
              field.path.length === pathStack.length &&
              field.path.every((segment, i) => segment === pathStack[i])
          );

          if (isList) {
            pathStack.pop();
            return null;
          }

          hasFields = true;
          return undefined;
        },
        leave: () => {
          pathStack.pop();
        },
      },
    });

    return hasFields ? filtered : null;
  }

  // Filter variables to only include used ones
  function filterVariables(
    variables: Variables | undefined,
    document: DocumentNode
  ): Variables | undefined {
    if (!variables) return undefined;

    const usedVariables = new Set<string>();

    visit(document, {
      Variable: (node) => {
        usedVariables.add(node.name.value);
      },
    });

    const filtered: Variables = {};
    const varsObj = variables as Record<string, unknown>;
    for (const key of usedVariables) {
      if (key in varsObj) {
        (filtered as Record<string, unknown>)[key] = varsObj[key];
      }
    }

    return isEmpty(filtered) ? undefined : filtered;
  }

  // Execute pagination for a list field to get ALL records
  async function executeListFieldPagination(
    document: DocumentNode,
    variables: Variables | undefined,
    field: ListField
  ): Promise<unknown[]> {
    const results: unknown[] = [];
    let currentSkip = field.skipValue || 0;
    let hasMore = true;

    while (hasMore) {
      const query = createSingleFieldQuery(
        document,
        field,
        currentSkip,
        THE_GRAPH_LIMIT
      );

      const response = await (
        theGraphClient.request as <D, V extends Variables>(
          doc: TadaDocumentNode<D, V>,
          vars: V
        ) => Promise<D>
      )(
        query as unknown as TadaDocumentNode<unknown, Variables>,
        filterVariables(variables, query) as Variables
      );

      // Use array path format for es-toolkit's get function
      const data = get(response, field.path);

      if (isArray(data)) {
        results.push(...data);
        // Continue if we got a full batch
        hasMore = data.length === THE_GRAPH_LIMIT;
      } else {
        hasMore = false;
      }

      currentSkip += THE_GRAPH_LIMIT;
    }

    return results;
  }

  return {
    async query<TResult, TVariables extends Variables, TValidated>(
      document: TadaDocumentNode<TResult, TVariables>,
      options: {
        input: Omit<
          TVariables,
          "skip" | "first" | "orderBy" | "orderDirection"
        >;
        output: z.ZodType<TValidated>;
      }
    ): Promise<TValidated> {
      const { input, output: schema } = options;

      try {
        // Extract all list fields
        const listFields = extractListFields(
          document as unknown as DocumentNode,
          input
        );

        // If no list fields, execute normally
        if (listFields.length === 0) {
          const queryResponse = await (
            theGraphClient.request as <D, V extends Variables>(
              doc: TadaDocumentNode<D, V>,
              vars: V
            ) => Promise<D>
          )(document, input as TVariables);

          return schema.parse(queryResponse);
        }

        // Execute paginated queries for all list fields
        const result: Record<string, unknown> = {};

        // Sort fields by depth to handle nested fields correctly
        const sortedFields = sortBy(listFields, [(field) => field.path.length]);

        // Process list fields in parallel for better performance
        const fieldDataPromises = sortedFields.map(async (field) => ({
          field,
          data: await executeListFieldPagination(
            document as unknown as DocumentNode,
            input as Variables,
            field
          ),
        }));

        const fieldResults = await Promise.all(fieldDataPromises);

        // Set results in order
        for (const { field, data } of fieldResults) {
          // Use array path format for es-toolkit's set function
          set(result, field.path, data);
        }

        // Execute non-list fields (single entity queries)
        const nonListQuery = createNonListQuery(
          document as unknown as DocumentNode,
          listFields
        );

        if (nonListQuery) {
          const nonListResult = await (
            theGraphClient.request as <D, V extends Variables>(
              doc: TadaDocumentNode<D, V>,
              vars: V
            ) => Promise<D>
          )(
            nonListQuery as unknown as TadaDocumentNode<unknown, Variables>,
            filterVariables(input as Variables, nonListQuery) as Variables
          );

          // Merge results, preserving list data
          const merged = customMerge(result, nonListResult);
          return schema.parse(merged);
        }

        return schema.parse(result);
      } catch (error) {
        throw errors.THE_GRAPH_ERROR({
          message:
            error instanceof ClientError
              ? (error.response.errors?.map((e) => e.message).join(", ") ??
                (error as Error).message)
              : (error as Error).message,
          data: {
            document,
            variables: input as TVariables,
            responseValidation:
              error instanceof z.ZodError ? z.prettifyError(error) : undefined,
          },
          cause: error,
        });
      }
    },
  } as const;
}

export type ValidatedTheGraphClient = ReturnType<
  typeof createValidatedTheGraphClient
>;

export const theGraphMiddleware = baseRouter.middleware((options) => {
  const { context, next, errors } = options;

  // Check if the context already has a validated TheGraph client
  if (context.theGraphClient && "query" in context.theGraphClient) {
    return next({
      context: {
        theGraphClient: context.theGraphClient,
      },
    });
  }

  // Create a new validated client with error handling capabilities
  const theGraphClient = createValidatedTheGraphClient(errors);

  // Pass the client to the next middleware/procedure in the chain
  return next({
    context: {
      theGraphClient,
    },
  });
});
