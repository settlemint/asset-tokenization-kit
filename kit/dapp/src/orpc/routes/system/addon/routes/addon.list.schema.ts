import { SortableListSchema } from "@/orpc/routes/common/schemas/sortable-list.schema";
import { addonFactoryTypeId, addonType } from "@atk/zod/addon-types";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumHash } from "@atk/zod/ethereum-hash";
import * as z from "zod";

/**
 * Schema for a system addon in the list
 */
export const SystemAddonSchema = z.object({
  /**
   * The addon contract address
   */
  id: ethereumAddress.describe("The addon contract address"),

  /**
   * The name of the system addon
   */
  name: z.string().describe("The name of the system addon"),

  /**
   * The type ID of the system addon
   */
  typeId: addonFactoryTypeId().describe("The type ID of the system addon"),

  /**
   * The transaction hash where the addon was deployed
   */
  deployedInTransaction: ethereumHash.describe(
    "The transaction hash where the addon was deployed"
  ),

  /**
   * The account that deployed the addon
   */
  account: ethereumAddress.describe("The account that deployed the addon"),
});

/**
 * Schema for the list of system addons
 * Following the same pattern as FactoryListSchema
 */
export const AddonListSchema = z.array(SystemAddonSchema);

/**
 * List schema for system addons that extends the base ListSchema
 * with an optional filter for addon types.
 */
export const SystemAddonListSchema = SortableListSchema.extend({
  /**
   * Filter addons by type.
   *
   * When not specified, all addons are returned.
   * When specified, only addons of the given type are returned.
   */
  typeId: addonType().optional().describe("Filter addons by type"),

  /**
   * Filter addons by account address.
   *
   * When specified, only addons deployed by the given account are returned.
   */
  account: ethereumAddress
    .optional()
    .describe("Filter addons by account address"),
});

/**
 * Schema for validating the GraphQL query response from TheGraph.
 *
 * This schema matches TheGraph's response structure with nested account objects.
 * The handler will transform this to match the flattened SystemAddonSchema.
 */
const TheGraphSystemAddonSchema = z.object({
  id: ethereumAddress.describe("The addon contract address"),
  name: z.string().describe("The name of the system addon"),
  typeId: addonFactoryTypeId().describe("The type ID of the system addon"),
  deployedInTransaction: ethereumHash.describe(
    "The transaction hash where the addon was deployed"
  ),
  account: z
    .object({
      id: ethereumAddress.describe("The account address"),
    })
    .describe("The account that deployed the addon"),
});

/**
 * Schema for validating the GraphQL query response from TheGraph.
 *
 * Wraps the array of system addons in a response object to match TheGraph's
 * response structure. This ensures type safety and runtime validation of the
 * data returned from the subgraph, with full support for auto-pagination.
 *
 * Auto-pagination integration:
 * - Automatically handles queries requesting >1000 addons
 * - Merges results from multiple 1000-item batches seamlessly
 * - Maintains filtering consistency across paginated requests
 * - Validates each batch response before merging
 *
 * @example
 * ```typescript
 * // Standard query (≤1000 addons)
 * const response = AddonsResponseSchema.parse({
 *   systemAddons: [
 *     {
 *       id: "0x123...",
 *       name: "MyAirdrop",
 *       typeId: "airdrops",
 *       deployedInTransaction: "0xabc...",
 *       account: { id: "0xdef..." }
 *     }
 *   ]
 * });
 *
 * // Auto-paginated query with filtering
 * const airdropAddons = await client.addons.list.query({
 *   typeId: "airdrops",
 *   limit: 5000 // Automatically paginated with filter preserved
 * });
 *
 * // Unlimited query (gets all addons)
 * const allAddons = await client.addons.list.query({
 *   // No limit = fetch everything via auto-pagination
 * });
 * ```
 */
export const AddonsResponseSchema = z.object({
  systemAddons: z.array(TheGraphSystemAddonSchema),
});

// Type exports for enhanced TypeScript integration
export type SystemAddon = z.infer<typeof SystemAddonSchema>;
export type AddonList = z.infer<typeof AddonListSchema>;
export type SystemAddonListInput = z.infer<typeof SystemAddonListSchema>;
export type AddonsResponse = z.infer<typeof AddonsResponseSchema>;
