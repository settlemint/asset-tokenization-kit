import type { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { IdentitySchema } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import {
  accessControlRoles,
  accessControlSchema,
} from "@atk/zod/access-control-roles";
import { assetExtensionArray } from "@atk/zod/asset-extensions";
import { assetSymbol } from "@atk/zod/asset-symbol";
import { assetType } from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { complianceTypeId } from "@atk/zod/compliance";
import { decimals } from "@atk/zod/decimals";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { timestamp } from "@atk/zod/timestamp";
import { from } from "dnum";
import { z } from "zod";

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
  createdAt: timestamp().describe("The timestamp of the token creation"),
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
  totalSupply: z.string().describe("The total supply of the token as string"),
  extensions: assetExtensionArray().describe("The extensions of the token"),
  implementsERC3643: z
    .boolean()
    .describe("Whether the token implements ERC3643"),
  implementsSMART: z.boolean().describe("Whether the token implements SMART"),
  identity: IdentitySchema.optional().describe("Identity associated with this token"),
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
  yield: z
    .object({
      id: ethereumAddress.describe("The address of the token"),
      schedule: z
        .object({
          id: ethereumAddress.describe(
            "The address of the yield schedule of the token"
          ),
        })
        .nullable(),
    })
    .nullable()
    .describe("The yield of the token"),
  bond: z
    .object({
      faceValue: bigDecimal().describe("The face value of the bond"),
      isMatured: z.boolean().describe("Whether the bond is matured"),
      maturityDate: timestamp().describe("The maturity date of the bond"),
      denominationAssetNeeded: bigDecimal().describe(
        "The amount of denomination asset needed to mature the bond"
      ),
      denominationAsset: z
        .object({
          id: ethereumAddress.describe("The address of the denomination asset"),
          decimals: decimals().describe(
            "The decimals of the denomination asset"
          ),
          symbol: assetSymbol().describe(
            "The symbol of the denomination asset"
          ),
        })
        .describe("The denomination asset of the bond"),
    })
    .nullable()
    .describe("The bond of the token"),
  fund: z
    .object({
      managementFeeBps: bigDecimal().describe("The management fee of the fund"),
    })
    .nullable()
    .describe("The fund of the token"),
  accessControl: accessControlSchema()
    .describe("The access control of the token")
    .optional(),
  complianceModuleConfigs: z
    .array(
      z.object({
        id: ethereumAddress,
        complianceModule: z.object({
          typeId: complianceTypeId(),
        }),
      })
    )
    .describe("Enabled compliance modules for this token"),
  userPermissions: z
    .object({
      roles: accessControlRoles.describe("The roles of the user for the token"),
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
          (() => {
            const actionsSchema: Record<
              keyof typeof TOKEN_PERMISSIONS,
              z.ZodType<boolean>
            > = {
              burn: z
                .boolean()
                .describe("Whether the user can execute the burn action"),
              grantRole: z
                .boolean()
                .describe("Whether the user can execute the grantRole action"),
              revokeRole: z
                .boolean()
                .describe("Whether the user can execute the revokeRole action"),
              mint: z
                .boolean()
                .describe("Whether the user can execute the mint action"),
              pause: z
                .boolean()
                .describe("Whether the user can execute the pause action"),
              addComplianceModule: z
                .boolean()
                .describe(
                  "Whether the user can execute the addComplianceModule action"
                ),
              approve: z
                .boolean()
                .describe("Whether the user can execute the approve action"),
              forcedRecover: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenForcedRecover action"
                ),
              freezeAddress: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenFreezeAddress action"
                ),
              freezePartial: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenFreezePartial action"
                ),
              unfreezePartial: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenUnfreezePartial action"
                ),
              recoverERC20: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenRecoverERC20 action"
                ),
              recoverTokens: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenRecoverTokens action"
                ),
              redeem: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenRedeem action"
                ),
              mature: z
                .boolean()
                .describe("Whether the user can execute the mature action"),
              removeComplianceModule: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenRemoveComplianceModule action"
                ),
              setCap: z
                .boolean()
                .describe("Whether the user can execute the setCap action"),
              setYieldSchedule: z
                .boolean()
                .describe(
                  "Whether the user can execute the tokenSetYieldSchedule action"
                ),
              transfer: z
                .boolean()
                .describe("Whether the user can execute the transfer action"),
              unpause: z
                .boolean()
                .describe("Whether the user can execute the unpause action"),
              updateCollateral: z
                .boolean()
                .describe(
                  "Whether the user can execute the updateCollateral action"
                ),
              withdrawDenominationAsset: z
                .boolean()
                .describe(
                  "Whether the user can execute the withdrawDenominationAsset action"
                ),
            };
            return actionsSchema;
          })()
        )
        .describe("The actions on the token the user is allowed to execute"),
    })
    .optional()
    .describe("The permissions of the user for the token"),
  stats: z
    .object({
      balancesCount: z
        .number()
        .describe("The number of accounts holding this token"),
      totalValueInBaseCurrency: bigDecimal().describe(
        "The total value in base currency of the token"
      ),
    })
    .nullable()
    .describe("The stats of the token"),
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
