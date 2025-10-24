/**
 * @fileoverview Entity listing and management functionality for the Asset Tokenization Kit system.
 *
 * This module provides the core API endpoint for retrieving and filtering blockchain entities
 * (tokenized assets, vaults, custodians) with their associated metadata, claims, and registration status.
 *
 * The entity list handler queries The Graph protocol to fetch identity records from the blockchain,
 * transforms them into a standardized format, and delegates entity-type filtering to the subgraph
 * for consistent pagination and reduced post-processing.
 *
 * @module EntityListHandler
 * @description Handles entity discovery, type detection, and status aggregation for the dApp UI
 * @since 1.0.0
 */

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import type { VariablesOf } from "@settlemint/sdk-thegraph";
import * as z from "zod";
import {
  EntityListInputSchema,
  EntityListOutputSchema,
} from "./entity.list.schema";

/**
 * GraphQL query for fetching blockchain entities with their associated metadata.
 *
 * This query retrieves identity records from The Graph subgraph, focusing on contract
 * identities that represent tokenized assets. Each identity includes its associated
 * account information, claims (verification credentials), and registration status.
 *
 * The query uses pagination and ordering to handle large datasets efficiently,
 * while the @fetchAll directive on the total field ensures accurate count calculation
 * across all pages.
 *
 * @constant {GraphQLQuery} ENTITY_LIST_QUERY
 */
const ENTITY_LIST_QUERY = theGraphGraphql(`
  query EntityList(
    $first: Int!
    $skip: Int!
    $orderBy: Identity_orderBy!
    $orderDirection: OrderDirection!
    $where: Identity_filter
  ) {
    identities(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      isContract
      entityType
      account {
        id
        isContract
        contractName
      }
      deployedInTransaction
      claims {
        id
        revoked
      }
      registered(first: 1) {
        id
      }
    }
    total: identities(where: $where) @fetchAll {
      id
    }
  }
`);

/**
 * Zod schema for validating GraphQL response data from the entity list query.
 *
 * This schema ensures type safety when processing The Graph subgraph responses,
 * handling nullable fields and providing sensible defaults for optional arrays.
 * The schema structure mirrors the GraphQL query shape while accommodating
 * the subgraph's nullable field patterns.
 *
 * @constant {ZodSchema} EntityListGraphSchema
 */
const EntityListGraphSchema = z.object({
  identities: z
    .array(
      z.object({
        /** Ethereum address serving as the identity's unique identifier */
        id: z.string(),
        /** Whether this identity represents a smart contract */
        isContract: z.boolean().nullish(),
        /** High-level entity type classification */
        entityType: z.string().nullish(),
        /** Associated account information for contract entities */
        account: z
          .object({
            /** Contract address (may differ from identity address) */
            id: z.string(),
            /** Whether the account is a contract */
            isContract: z.boolean().nullish(),
            /** Contract name from deployment metadata */
            contractName: z.string().nullish(),
          })
          .nullish(),
        /** Transaction hash where the identity was deployed */
        deployedInTransaction: z.string().nullish(),
        /** Claims (verification credentials) associated with this identity */
        claims: z
          .array(
            z.object({
              /** Unique claim identifier */
              id: z.string(),
              /** Whether this claim has been revoked */
              revoked: z.boolean(),
            })
          )
          .default([]),
        /** Registration records indicating entity activation status */
        registered: z.array(z.object({ id: z.string() })).default([]),
      })
    )
    .default([]),
  /** Total count of entities matching the query filters */
  total: z.array(z.object({ id: z.string() })).default([]),
});

/** Valid fields for ordering entity query results */
type EntityOrderField = "id" | "deployedInTransaction";

/** Type representing the GraphQL where clause filters for entity queries */
type EntityListWhere = VariablesOf<typeof ENTITY_LIST_QUERY>["where"];

/** Complete set of variables required for the entity list GraphQL query */
type EntityListVariables = VariablesOf<typeof ENTITY_LIST_QUERY>;

/**
 * Resolves client-side ordering field names to valid GraphQL ordering fields.
 *
 * The UI may use different field names for user-friendly display (like "lastActivity")
 * while The Graph subgraph requires specific field names for ordering. This function
 * maps between these naming conventions and provides a sensible default.
 *
 * @param orderBy - The ordering field requested by the client
 * @returns The corresponding GraphQL-compatible field name
 *
 * @example
 * ```typescript
 * resolveOrderBy("lastActivity") // Returns "deployedInTransaction"
 * resolveOrderBy("identityAddress") // Returns "id"
 * resolveOrderBy(undefined) // Returns "deployedInTransaction" (default)
 * ```
 */
const resolveOrderBy = (orderBy: string | undefined): EntityOrderField => {
  // Map user-friendly "lastActivity" to the actual transaction field
  if (orderBy === "lastActivity" || orderBy === "deployedInTransaction") {
    return "deployedInTransaction";
  }

  // Map address-related ordering to the identity ID field
  if (orderBy === "identityAddress" || orderBy === "id") {
    return "id";
  }

  // Default to ordering by deployment time for most recent entities first
  return "deployedInTransaction";
};

/**
 * Main handler for listing blockchain entities with filtering, pagination, and type detection.
 *
 * This endpoint retrieves tokenized assets, vaults, and other contract entities from The Graph
 * subgraph, enriches them with type information and claim statistics, and returns a paginated
 * list suitable for UI display. The handler applies role-based access control and pushes
 * entity-type filtering down to the subgraph for efficient querying.
 *
 * **Permission Requirements:**
 * Requires one of: identityManager, systemManager, claimIssuer, or systemModule roles
 *
 * **Business Logic:**
 * 1. Queries The Graph for contract identities within the current system
 * 2. Calculates claim statistics (active vs revoked) for verification status
 * 3. Uses subgraph-provided entity type metadata for classification
 * 4. Determines registration status based on registry records
 *
 * @param input - Pagination, ordering, and filtering parameters
 * @param context - Request context including system configuration and Graph client
 * @returns Paginated list of entities with metadata and statistics
 *
 * @throws {Error} When Graph query fails or system context is missing
 * @throws {AuthError} When user lacks required permissions
 *
 * @example
 * ```typescript
 * // Basic entity listing
 * const entities = await entityList({
 *   limit: 20,
 *   offset: 0,
 *   orderBy: "lastActivity",
 *   orderDirection: "desc"
 * });
 *
 * // Filtered by entity type
 * const tokens = await entityList({
 *   limit: 50,
 *   filters: { entityType: "token" }
 * });
 * ```
 *
 * @see {@link SYSTEM_PERMISSIONS.entityList} for permission requirements
 */
export const entityList = systemRouter.system.entity.list
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.entityList,
      getAccessControl: ({ context }) =>
        context.system?.systemAccessManager?.accessControl,
    })
  )
  .handler(async ({ input, context }) => {
    // Validate and extract input parameters using Zod schema
    const parsedInput = EntityListInputSchema.parse(input);
    const { limit, offset, orderDirection, orderBy, filters } = parsedInput;
    const { system } = context;

    // Apply pagination defaults and resolve ordering parameters
    const first = limit ?? 50; // Default page size balances performance with usability
    const skip = offset;
    const graphOrderBy = resolveOrderBy(orderBy);
    const graphOrderDirection: "asc" | "desc" =
      orderDirection === "desc" ? "desc" : "asc";

    // Build GraphQL where clause to filter for contract entities within this system
    // We filter by identityFactory to ensure we only see entities deployed by this system instance
    const whereFilters: EntityListWhere = {
      identityFactory: system.identityFactory.id, // Scope to current system's entities
      isContract: true, // Only show contract entities, not EOA identities
    };
    if (filters?.entityType) {
      whereFilters.entityType = filters.entityType;
    }

    // Prepare GraphQL query variables with pagination and filtering
    const variables: EntityListVariables = {
      first,
      skip,
      orderBy: graphOrderBy,
      orderDirection: graphOrderDirection,
      where: whereFilters,
    };

    // Execute The Graph query with type-safe response validation
    const response = await context.theGraphClient?.query(ENTITY_LIST_QUERY, {
      input: variables,
      output: EntityListGraphSchema,
    });

    const identities = response?.identities ?? [];

    // Transform GraphQL response data into standardized entity format
    const items = identities.map((identity) => {
      // Calculate claim statistics for verification status display
      const claims = identity.claims ?? [];
      const revokedClaimsCount = claims.filter((claim) => claim.revoked).length;
      const activeClaimsCount = claims.length - revokedClaimsCount;

      // Extract contract information from the identity's associated account
      const contractAddress = identity.account?.id ?? null;
      const contractName = identity.account?.contractName ?? null;

      const entityType = identity.entityType ?? null;

      // Determine registration status based on presence of registry records
      // Entities are "registered" when they appear in the identity registry, "pending" otherwise
      const status = identity.registered.length > 0 ? "registered" : "pending";

      return {
        id: identity.id,
        contractAddress,
        contractName,
        entityType,
        isContract: identity.isContract ?? null,
        status,
        verificationBadges: [], // Placeholder for future verification badge system
        lastActivity: identity.deployedInTransaction ?? "",
        activeClaimsCount,
        revokedClaimsCount,
        deployedInTransaction: identity.deployedInTransaction ?? "",
      };
    });

    /**
     * Calculate total count using the subgraph's aggregate, which already
     * respects the applied filters in the where clause.
     */
    const total = response?.total?.length ?? items.length;

    // Validate and return the final response using the output schema
    return EntityListOutputSchema.parse({
      items,
      total,
      limit,
      offset,
    });
  });

/**
 * Default export of the entity list handler for module compatibility.
 *
 * @default entityList
 */
export default entityList;
