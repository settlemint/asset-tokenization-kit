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
 *
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
 *
 * @see {@link ../../common/schemas/create.schema} - Base create schema
 */

import { z } from 'zod/v4';
import { ethereumAddress } from '@/lib/zod/validators/ethereum-address';
import { CreateSchema } from '../../common/schemas/create.schema';
import { TransactionTrackingMessagesSchema } from '../../common/schemas/transaction-messages.schema';

/**
 * Combined messages schema for system creation
 * Extends common transaction tracking messages with system-specific messages
 */
export const SystemCreateMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    systemCreated: z
      .string()
      .optional()
      .default('System successfully created and bootstrapped.'),
    creatingSystem: z.string().optional().default('Creating new system...'),
    systemCreationFailed: z
      .string()
      .optional()
      .default('Failed to create system. Please try again.'),
    bootstrappingSystem: z
      .string()
      .optional()
      .default('Bootstrapping system...'),
    bootstrapFailed: z
      .string()
      .optional()
      .default('Failed to bootstrap system. Please try again.'),
    systemCreatedBootstrapFailed: z
      .string()
      .optional()
      .default(
        'System created but bootstrap failed. You may need to manually bootstrap the system.'
      ),
    // Messages used by useStreamingMutation hook
    initialLoading: z.string().optional().default('Creating new system...'),
    noResultError: z
      .string()
      .optional()
      .default('No system address received from transaction.'),
    defaultError: z.string().optional().default('Failed to create system.'),
  });

export const SystemCreateSchema = CreateSchema.extend({
  /**
   * The system registry contract address.
   *
   * Defaults to the standard SettleMint system registry address if not provided.
   * This contract is responsible for managing system-wide configurations and
   * deployments within the SettleMint platform.
   */
  contract: ethereumAddress
    .describe('The address of the contract to call this function on')
    .default('0x5e771e1417100000000000000000000000020088'),

  /**
   * Optional custom messages for the operation.
   * If not provided, default English messages will be used.
   * This allows for localization by passing translated messages from the client.
   */
  messages: SystemCreateMessagesSchema.optional(),
});

/**
 * Output schema for streaming events
 */
export const SystemCreateOutputSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'failed']),
  message: z.string(),
  result: ethereumAddress.optional(),
});

// Type exports
export type SystemCreateMessages = z.infer<typeof SystemCreateMessagesSchema>;
