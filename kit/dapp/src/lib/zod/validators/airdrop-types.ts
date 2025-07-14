import { z } from "zod";

/**
 * Available airdrop distribution mechanisms.
 * @remarks
 * These types define different methods for distributing tokens:
 * - `whitelist`: Direct distribution to pre-approved addresses
 * - `merkle`: Merkle tree-based distribution for gas-efficient claims
 * - `claim`: Open claiming mechanism where users can request tokens
 */
export const airdropTypes = ["whitelist", "merkle", "claim"] as const;

/**
 * Creates a Zod schema for validating airdrop types.
 * @returns A Zod enum schema that validates airdrop type values
 * @example
 * ```typescript
 * const schema = airdropType();
 * const result = schema.parse("whitelist"); // Valid
 * const invalid = schema.parse("invalid"); // Throws ZodError
 * ```
 */
export const airdropType = () =>
  z.enum(airdropTypes).describe("Type of airdrop mechanism");

/**
 * Type representing valid airdrop mechanisms.
 * Inferred from the airdropType schema with type safety.
 */
export type AirdropType = z.infer<ReturnType<typeof airdropType>>;

/**
 * Type guard to check if a value is a valid airdrop type.
 * @param value - The value to check
 * @returns `true` if the value is a valid airdrop type, `false` otherwise
 * @example
 * ```typescript
 * if (isAirdropType("whitelist")) {
 *   // TypeScript knows this is an AirdropType
 *   console.log("Valid airdrop type");
 * }
 * ```
 */
export function isAirdropType(value: unknown): value is AirdropType {
  // Use safeParse to validate without throwing errors
  return airdropType().safeParse(value).success;
}

/**
 * Safely parse and return an airdrop type or throw an error.
 * @param value - The value to parse as an airdrop type
 * @returns The validated airdrop type
 * @throws {Error} If the value is not a valid airdrop type
 * @example
 * ```typescript
 * try {
 *   const type = getAirdropType("merkle"); // Returns "merkle" as AirdropType
 *   const invalid = getAirdropType("invalid"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid airdrop type");
 * }
 * ```
 */
export function getAirdropType(value: unknown): AirdropType {
  return airdropType().parse(value);
}
