import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import { z } from "zod/v4";

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
   * User's identity claims.
   * Each claim has a name and a set of key-value pairs representing the claim data.
   */
  claims: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});

// Define response schema for type-safe GraphQL validation
// Using Zod for runtime validation with automatic TypeScript type inference
// The nullable modifier handles cases where the account doesn't exist
export const AccountResponseSchema = z.object({
  account: z
    .object({
      id: z.string(),
    })
    .nullable(),
});
