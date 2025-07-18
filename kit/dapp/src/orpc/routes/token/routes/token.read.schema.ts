import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { assetType } from "@/lib/zod/validators/asset-types";
import { bigDecimal } from "@/lib/zod/validators/bigdecimal";
import { decimals } from "@/lib/zod/validators/decimals";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { timestamp } from "@/lib/zod/validators/timestamp";
import type { TokenExtensions } from "@/orpc/middlewares/system/token.middleware";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { from } from "dnum";
import { z } from "zod";

/**
 * Available token roles in the system
 *
 * These roles define the various permission levels that can be assigned
 * to users for interacting with tokenized assets. Each role grants
 * specific capabilities within the token contract.
 *
 * @see {@link AccessControlRoles} for the complete type definition
 */
const ROLES: AccessControlRoles[] = [
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
 * Available token extensions in the system
 *
 * These extensions define the various capabilities that can be added to a token contract.
 * Each extension grants specific capabilities within the token contract.
 *
 * @see {@link TokenExtensions} for the complete type definition
 */
const EXTENSIONS: TokenExtensions[] = [
  "ACCESS_MANAGED",
  "BURNABLE",
  "CAPPED",
  "COLLATERAL",
  "CUSTODIAN",
  "HISTORICAL_BALANCES",
  "PAUSABLE",
  "REDEEMABLE",
  "YIELD",
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
  type: assetType(),
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
  totalSupply: z.string().describe("The total supply of the token as string"),
  extensions: z
    .array(z.enum(EXTENSIONS))
    .describe("The extensions of the token"),
  implementsERC3643: z
    .boolean()
    .describe("Whether the token implements ERC3643"),
  implementsSMART: z.boolean().describe("Whether the token implements SMART"),
  pausable: z.object({
    paused: z.boolean().describe("Whether the token is paused"),
  }),
  requiredClaimTopics: z
    .array(z.string())
    .describe("The required claim topics of the token"),
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
          ROLES.reduce<Record<AccessControlRoles, z.ZodType<boolean>>>(
            (acc, role) => {
              acc[role] = z
                .boolean()
                .describe(`Whether the user has the ${role} role`);
              return acc;
            },
            {} as Record<AccessControlRoles, z.ZodType<boolean>>
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
      notAllowedReason: z
        .string()
        .describe(
          "The reason the user is not allowed to interact with the token"
        )
        .optional(),
      actions: z
        .object(
          Object.keys(TOKEN_PERMISSIONS).reduce<
            Record<keyof typeof TOKEN_PERMISSIONS, z.ZodType<boolean>>
          >(
            (acc, action) => {
              acc[action as keyof typeof TOKEN_PERMISSIONS] = z
                .boolean()
                .describe(`Whether the user can execute the ${action} action`);
              return acc;
            },
            {} as Record<keyof typeof TOKEN_PERMISSIONS, z.ZodType<boolean>>
          )
        )
        .describe("The actions on the token the user is allowed to execute"),
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
