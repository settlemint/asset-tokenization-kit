/**
 * Schema for System Creation Operations
 *
 * This schema extends the common CreateSchema to provide system-specific
 * defaults and validation for creating new system contracts. It sets a
 * default contract address for the system registry, which is the standard
 * deployment address for the SettleMint system contracts.
 *
 * The default address (0x5e771e1417100000000000000000000000020088) is a
 * deterministic address used across SettleMint deployments for the system
 * registry contract, ensuring consistency across different environments.
 * @example
 * ```typescript
 * // Using default system registry
 * const input = {
 *   verification: { code: "123456", type: "pincode" }
 * };
 *
 * // Using custom system contract
 * const input = {
 *   contract: "0x...",
 *   verification: { code: "123456", type: "pincode" }
 * };
 * ```
 * @see {@link ../../common/schemas/create.schema} - Base create schema
 */

import { ethereumAddress } from "@atk/zod/ethereum-address";
import { MutationInputSchema } from "../../common/schemas/mutation.schema";

export const SystemCreateSchema = MutationInputSchema.extend({
  /**
   * The system registry contract address.
   *
   * Defaults to the standard SettleMint system registry address if not provided.
   * This contract is responsible for managing system-wide configurations and
   * deployments within the SettleMint platform.
   */
  contract: ethereumAddress
    .describe("The address of the contract to call this function on")
    .default("0x5e771e1417100000000000000000000000020088"),
});
