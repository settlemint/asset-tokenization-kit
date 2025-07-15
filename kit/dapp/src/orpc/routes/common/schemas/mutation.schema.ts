/**
 * Common Schema for Create Operations
 *
 * This schema defines the common structure for all create operations that involve
 * blockchain transactions. It provides a standardized way to specify the target
 * contract and handle multi-factor authentication for transaction signing.
 *
 * The schema is designed to be extended by specific create operations that need
 * additional fields while maintaining consistent authentication and contract
 * targeting patterns.
 * @example
 * ```typescript
 * // Extend for specific create operations
 * const SystemCreateSchema = CreateSchema.extend({
 *   name: z.string(),
 *   symbol: z.string(),
 *   decimals: z.number()
 * });
 *
 * // Usage in a handler
 * const { contract, verification, ...specificData } = input;
 * ```
 * @see {@link @/lib/zod/validators/ethereum-address} - Ethereum address validation
 * @see {@link @/lib/zod/validators/verification-code} - Verification code validation
 * @see {@link @/lib/zod/validators/verification-type} - Verification type options
 */

import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

export const MutationInputSchema = z.object({
  /**
   * The Ethereum address of the smart contract to interact with.
   *
   * When provided, the create operation will target this specific contract
   * instance. When omitted, the operation may use a default contract or
   * deploy a new one, depending on the specific implementation.
   * @optional
   */
  contract: ethereumAddress
    .optional()
    .describe("The address of the contract to call this function on"),

  /**
   * Multi-factor authentication credentials for transaction signing.
   *
   * This object contains the verification code and type required to authorize
   * the blockchain transaction. The verification ensures that only authorized
   * users can execute state-changing operations on the blockchain.
   *
   * Supported verification types:
   * - pincode: Default option, uses a PIN code for verification
   * - secret-code: Uses a secret code for enhanced security
   * - two-factor: Uses time-based one-time passwords (TOTP)
   */
  verification: UserVerificationSchema,
});

export const MutationInputSchemaWithContract = MutationInputSchema.extend({
  contract: ethereumAddress.describe(
    "The address of the contract to call this function on"
  ),
});

export const MutationOutputSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed"]),
  message: z.string(),
  transactionHash: z.string().optional(),
  result: z.string().optional(), // For compatibility with useStreamingMutation hook
});
