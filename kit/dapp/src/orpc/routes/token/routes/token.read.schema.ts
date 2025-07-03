import { decimals } from "@/lib/zod/validators/decimals";
import type { TokenRoles } from "@/orpc/middlewares/system/token.middleware";
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
export const TokenSchema = z.object({
  id: z.string(),
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
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
