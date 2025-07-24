import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import { z } from "zod";

export const AccountReadSchema = z.object({
  wallet: ethereumAddress.describe(
    "The wallet address of the user to read the account for"
  ),
});

/**
 * Schema definition for a SMART System entity.
 *
 * Systems are the core infrastructure contracts in the SMART protocol that
 * orchestrate the deployment and management of tokenized assets. Each system
 * manages its own set of factories, registries, and compliance modules.
 * @remarks
 * The system ID is the blockchain address where the system contract is deployed.
 * This address serves as the unique identifier for all operations within that
 * particular SMART protocol instance.
 */
export const AccountSchema = z.object({
  /**
   * Unique identifier of the system - the Ethereum address of the deployed system contract.
   * This address is used to interact with the system and all its associated components.
   */
  id: ethereumAddress,
  /**
   * User's country as ISO 3166-1 alpha-2 code.
   * Used for geolocation and country-specific features.
   * @example "US", "GB", "DE", "FR"
   */
  country: isoCountryCode.optional(),

  /**
   * The identity of the account.
   */
  identity: ethereumAddress.optional(),

  /**
   * User's identity claims.
   * Only returns the names of the claims
   */
  claims: z.array(z.string()).optional(),
});

// Define response schema for type-safe GraphQL validation
// Using Zod for runtime validation with automatic TypeScript type inference
// The nullable modifier handles cases where the account doesn't exist
export const AccountResponseSchema = z.object({
  account: z
    .object({
      id: z.string(),
      country: z.number().nullable().optional(),
      identity: z
        .object({
          id: z.string(),
          claims: z.array(
            z.object({
              name: z.string(),
            })
          ),
        })
        .nullable()
        .optional(),
    })
    .nullable(),
});
