import { bigDecimal } from "@/lib/zod/validators/bigdecimal";
import { decimals } from "@/lib/zod/validators/decimals";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { timestamp } from "@/lib/zod/validators/timestamp";
import type { TokenRoles } from "@/orpc/middlewares/system/token.middleware";
import { from } from "dnum";
import { z } from "zod/v4";

/**
 * Available token roles in the system
 *
 * These roles define the various permission levels that can be assigned
 * to users for interacting with tokenized assets. Each role grants
 * specific capabilities within the token contract.
 *
 * @see {@link TokenRoles} for the complete type definition
 */
const ROLES: TokenRoles[] = [
  "admin",
  "bypassListManager",
  "claimManager",
  "custodian",
  "deployer",
  "emergency",
  "implementationManager",
  "registryManager",
  "registrar",
  "storageModifier",
  "supplyManagement",
  "governance",
];

/**
 * Zod schema for token details with user permissions
 *
 * This schema defines the structure of token data returned from the API,
 * including basic token information and the requesting user's permissions
 * for that specific token.
 *
 * @property {string} id - The token contract address (Ethereum address)
 * @property {string} name - The human-readable name of the token (e.g., "US Treasury Bond")
 * @property {string} symbol - The token symbol (e.g., "USTB")
 * @property {number} decimals - Number of decimal places for the token (typically 18 for ERC20)
 * @property {Object} [userPermissions] - Optional permissions object for the current user
 * @property {Object} userPermissions.roles - Boolean flags for each role the user has
 * @property {boolean} userPermissions.isCompliant - Whether the user meets compliance requirements
 * @property {boolean} userPermissions.isAllowed - Whether the user can interact with the token
 *
 * @example
 * ```typescript
 * // Example token data that validates against this schema
 * const tokenData = {
 *   id: "0x1234567890abcdef1234567890abcdef12345678",
 *   name: "Corporate Bond Token",
 *   symbol: "CBT",
 *   decimals: 18,
 *   userPermissions: {
 *     roles: {
 *       admin: false,
 *       bypassListManager: false,
 *       claimManager: false,
 *       custodian: true,
 *       deployer: false,
 *       emergency: false,
 *       implementationManager: false,
 *       registryManager: false,
 *       registrar: false,
 *       storageModifier: false,
 *       supplyManagement: true,
 *       governance: false
 *     },
 *     isCompliant: true,
 *     isAllowed: true
 *   }
 * };
 *
 * // Validate the data
 * const validated = TokenSchema.parse(tokenData);
 * ```
 *
 * @remarks
 * - The userPermissions field is optional and will only be present when the
 *   API is called with authentication
 * - The roles object dynamically includes all roles defined in the ROLES array
 * - Compliance and allowance checks are performed against the token's specific
 *   requirements and the user's identity claims
 */
/**
 * Schema for the raw token data from GraphQL
 * This matches what comes from TheGraph with totalSupply as string
 */
export const RawTokenSchema = z.object({
  id: ethereumAddress.describe("The token contract address"),
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
  totalSupply: z.string().describe("The total supply of the token as string"),
  pausable: z.object({
    paused: z.boolean().describe("Whether the token is paused"),
  }),
  collateral: z
    .object({
      collateral: bigDecimal()
        .describe("The collateral of the token")
        .nullish()
        .transform((val) => val ?? from(0)),
      expiryTimestamp: timestamp()
        .nullable()
        .describe("The expiry timestamp of the collateral"),
    })
    .nullable()
    .describe("The collateral of the token"),
  capped: z
    .object({
      cap: bigDecimal().describe("The cap of the token"),
    })
    .nullable()
    .describe("The max supply of the token"),
  createdBy: z
    .object({
      id: ethereumAddress.describe(
        "The address of the user who created the token"
      ),
    })
    .describe("The user who created the token"),
  redeemable: z
    .object({
      redeemedAmount: bigDecimal().describe("The amount of tokens redeemed"),
    })
    .nullable()
    .describe("The amount of tokens redeemed"),
  bond: z
    .object({
      faceValue: bigDecimal().describe("The face value of the bond"),
      isMatured: z.boolean().describe("Whether the bond is matured"),
      maturityDate: timestamp().describe("The maturity date of the bond"),
    })
    .nullable()
    .describe("The bond of the token"),
  fund: z
    .object({
      managementFeeBps: bigDecimal().describe("The management fee of the fund"),
    })
    .nullable()
    .describe("The fund of the token"),
  userPermissions: z
    .object({
      roles: z
        .object(
          ROLES.reduce<Record<TokenRoles, z.ZodType<boolean>>>(
            (acc, role) => {
              acc[role] = z
                .boolean()
                .describe(`Whether the user has the ${role} role`);
              return acc;
            },
            {} as Record<TokenRoles, z.ZodType<boolean>>
          )
        )
        .describe("The roles of the user for the token"),
      isCompliant: z
        .boolean()
        .describe(
          "Whether the user has the required claim topics to interact with the token"
        ),
      isAllowed: z
        .boolean()
        .describe("Whether the user is allowed to interact with the token"),
    })
    .optional()
    .describe("The permissions of the user for the token"),
});

/**
 * Schema for the transformed token data with totalSupply as Dnum
 * This is what the API returns after transformation
 */
export const TokenSchema = RawTokenSchema.extend({
  totalSupply: bigDecimal().describe("The total supply of the token"),
});

/**
 * Type representing the parsed token data with totalSupply as Dnum
 */
export type Token = z.infer<typeof TokenSchema>;

export const TokenReadInputSchema = z.object({
  tokenAddress: ethereumAddress,
});

/**
 * Type-safe transformer function that converts RawToken to Token
 * Ensures totalSupply is properly transformed from string to Dnum
 *
 * @param raw - The raw token data from The Graph
 * @returns The transformed token with totalSupply as Dnum
 * @example
 * ```typescript
 * const rawToken = {
 *   id: "0x123...",
 *   name: "Token",
 *   totalSupply: "1000000000000000000"
 * };
 * const token = transformRawToken(rawToken);
 * // token.totalSupply is now a Dnum for precise arithmetic
 * ```
 */
export function transformRawToken(raw: z.infer<typeof RawTokenSchema>): Token {
  return TokenSchema.parse(raw);
}

/**
 * Type guard function to check if a value is a valid Token
 *
 * @param value - The value to check
 * @returns true if the value is a valid Token
 */
export function isToken(value: unknown): value is Token {
  return TokenSchema.safeParse(value).success;
}
