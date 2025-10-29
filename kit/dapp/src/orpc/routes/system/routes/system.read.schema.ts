import type { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import {
  accessControlSchema,
  systemAccessControlRolesSchema,
} from "@atk/zod/access-control-roles";
import { addonFactoryTypeId } from "@atk/zod/addon-types";
import { assetFactoryTypeId } from "@atk/zod/asset-types";
import { complianceTypeId } from "@atk/zod/compliance";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumCompositeId } from "@atk/zod/ethereum-composite-id";
import { ethereumHex } from "@atk/zod/ethereum-hex";
import { isoCountryCode } from "@atk/zod/iso-country-code";
import { z } from "zod";

/**
 * Schema for token factory entries
 */
const TokenFactorySchema = z.object({
  id: ethereumAddress,
  name: z.string(),
  typeId: assetFactoryTypeId(),
});

/**
 * Schema for system addon entries
 */
const SystemAddonSchema = z.object({
  id: ethereumAddress,
  name: z.string(),
  typeId: addonFactoryTypeId(),
});

/**
 * Schema for compliance module entries
 */
const ComplianceModuleSchema = z.object({
  id: ethereumCompositeId.describe(
    "Compliance module ID (concatenation of system address and compliance module address)"
  ),
  module: ethereumAddress.describe("Compliance module address"),
  typeId: complianceTypeId().describe("Compliance module type ID"),
  name: z.string().describe("Compliance module name"),
});

/**
 * Output schema for system read operations
 */
export const SystemSchema = z.object({
  /**
   * The system contract address
   */
  id: ethereumAddress.describe("System address"),
  /**
   * The transaction hash where the system was deployed
   */
  deployedInTransaction: z
    .string()
    .describe("Transaction hash where system was deployed"),
  /**
   * The token factory registry
   */
  tokenFactoryRegistry: z.object({
    id: ethereumAddress.describe("Token factory registry address"),
    tokenFactories: z
      .array(TokenFactorySchema)
      .describe("Array of registered token factories"),
  }),
  /**
   * The system addon registry
   */
  systemAddonRegistry: z.object({
    id: ethereumAddress.describe("System addon registry address"),
    systemAddons: z
      .array(SystemAddonSchema)
      .describe("Array of registered system addons"),
  }),
  /**
   * The compliance module registry
   */
  complianceModuleRegistry: z.object({
    id: ethereumAddress.describe("Compliance module registry address"),
    complianceModules: z
      .array(ComplianceModuleSchema)
      .describe("Array of registered compliance modules"),
  }),
  /**
   * The system access manager
   */
  systemAccessManager: z.object({
    id: ethereumAddress.describe("System access manager address"),
    accessControl: accessControlSchema().describe(
      "Access control configuration"
    ),
  }),
  /**
   * The identity factory
   */
  identityFactory: z.object({
    id: ethereumAddress.describe("Identity factory address"),
    identities: z
      .array(
        z.object({
          id: ethereumAddress.describe("Identity contract address"),
        })
      )
      .describe("Identities created by this factory for the user"),
  }),
  /**
   * The identity registry storage
   */
  identityRegistryStorage: z.object({
    id: ethereumAddress.describe("Identity registry storage address"),
    registeredIdentities: z
      .array(
        z.object({
          id: ethereumHex.describe("Registered identity ID"),
          country: z.number().describe("ISO country code"),
        })
      )
      .describe("Registered identities for the user"),
  }),
  /**
   * The identity registry
   */
  identityRegistry: z.object({
    id: ethereumAddress.describe("Identity registry address"),
  }),
  /**
   * The trusted issuers registry
   */
  trustedIssuersRegistry: z.object({
    id: ethereumAddress.describe("Trusted issuers registry address"),
  }),
  /**
   * The topic scheme registry
   */
  topicSchemeRegistry: z.object({
    id: ethereumAddress.describe("Topic scheme registry address"),
  }),
  /**
   * The permissions of the user for the system
   */
  userPermissions: z
    .object({
      /**
       * The roles of the user for the system
       */
      roles: systemAccessControlRolesSchema.describe(
        "The roles of the user for the system"
      ),

      /**
       * The actions on the system the user is allowed to execute
       */
      actions: z
        .object(
          (() => {
            const actionsSchema: Record<
              keyof typeof SYSTEM_PERMISSIONS,
              z.ZodType<boolean>
            > = {
              accountSearch: z
                .boolean()
                .describe("Whether the user can search accounts"),
              addonCreate: z
                .boolean()
                .describe("Whether the user can create addons"),
              addonFactoryCreate: z
                .boolean()
                .describe("Whether the user can create addon factories"),
              claimCreate: z
                .boolean()
                .describe("Whether the user can create claims"),
              claimList: z
                .boolean()
                .describe("Whether the user can list claims"),
              claimRevoke: z
                .boolean()
                .describe("Whether the user can revoke claims"),
              complianceModuleCreate: z
                .boolean()
                .describe("Whether the user can create compliance modules"),
              grantRole: z
                .boolean()
                .describe("Whether the user can grant roles"),
              identityCreate: z
                .boolean()
                .describe("Whether the user can create identities"),
              identityRead: z
                .boolean()
                .describe("Whether the user can read identities"),
              identitySearch: z
                .boolean()
                .describe("Whether the user can search identities"),
              identityList: z
                .boolean()
                .describe("Whether the user can read identities"),
              entityList: z
                .boolean()
                .describe("Whether the user can list business entities"),
              identityRegister: z
                .boolean()
                .describe("Whether the user can register identities"),
              kycDelete: z
                .boolean()
                .describe("Whether the user can delete KYC profiles"),
              kycList: z
                .boolean()
                .describe("Whether the user can list KYC profiles"),
              kycRead: z
                .boolean()
                .describe("Whether the user can read KYC profiles"),
              kycUpsert: z
                .boolean()
                .describe("Whether the user can upsert KYC profiles"),
              revokeRole: z
                .boolean()
                .describe("Whether the user can revoke roles"),
              tokenCreate: z
                .boolean()
                .describe("Whether the user can create tokens"),
              tokenFactoryCreate: z
                .boolean()
                .describe("Whether the user can create token factories"),
              topicCreate: z
                .boolean()
                .describe("Whether the user can create topics"),
              topicDelete: z
                .boolean()
                .describe("Whether the user can delete topics"),
              topicUpdate: z
                .boolean()
                .describe("Whether the user can update topics"),
              trustedIssuerCreate: z
                .boolean()
                .describe("Whether the user can create trusted issuers"),
              trustedIssuerDelete: z
                .boolean()
                .describe("Whether the user can delete trusted issuers"),
              trustedIssuerUpdate: z
                .boolean()
                .describe("Whether the user can update trusted issuers"),
              userList: z.boolean().describe("Whether the user can list users"),
              userRead: z.boolean().describe("Whether the user can read users"),
              userSearch: z
                .boolean()
                .describe("Whether the user can search users"),
            };
            return actionsSchema;
          })()
        )
        .describe("The actions on the system the user is allowed to execute"),
    })
    .optional()
    .describe("The permissions of the user for the system"),

  /**
   * The user's identity information within this system
   */
  userIdentity: z
    .object({
      /**
       * The user's identity contract address
       */
      address: ethereumAddress.describe("User's identity contract address"),

      /**
       * The registered identity.
       */
      registered: z
        .object({
          isRegistered: z.literal(true),
          country: isoCountryCode,
        })
        .or(z.literal(false))
        .optional(),
    })
    .optional()
    .describe("The user's identity information within this system"),
});

export type System = z.infer<typeof SystemSchema>;
