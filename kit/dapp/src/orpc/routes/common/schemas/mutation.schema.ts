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
 * const { contract, walletVerification, ...specificData } = input;
 * ```
 * @see {@link @atk/zod/ethereum-address} - Ethereum address validation
 * @see {@link @atk/zod/verification-code} - Verification code validation
 * @see {@link @atk/zod/verification-type} - Verification type options
 */

import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const MutationInputSchema = z.object({
  /**
   * Multi-factor authentication credentials for transaction signing.
   *
   * This object contains the verification code and type required to authorize
   * the blockchain transaction. The verification ensures that only authorized
   * users can execute state-changing operations on the blockchain.
   *
   * Supported verification types:
   * - PINCODE: Default option, uses a PIN code for verification
   * - SECRET_CODES: Uses a secret code for enhanced security
   * - OTP: Uses time-based one-time passwords (TOTP)
   */
  walletVerification: UserVerificationSchema,
});

export const MutationInputSchemaWithContract = MutationInputSchema.extend({
  contract: ethereumAddress.describe(
    "The address of the contract to call this function on"
  ),
});
