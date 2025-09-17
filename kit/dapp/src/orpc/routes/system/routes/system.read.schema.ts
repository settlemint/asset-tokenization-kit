import type { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { accessControlRoles } from "@atk/zod/access-control-roles";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { accessControlSchema } from "@atk/zod/src/access-control-roles";
import { addonFactoryTypeId } from "@atk/zod/src/addon-types";
import { assetFactoryTypeId } from "@atk/zod/src/asset-types";
import { complianceTypeId } from "@atk/zod/src/compliance";
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
  id: ethereumAddress,
  typeId: complianceTypeId(),
  name: z.string(),
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
  }),
  /**
   * The identity registry storage
   */
  identityRegistryStorage: z.object({
    id: ethereumAddress.describe("Identity registry storage address"),
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
      roles: accessControlRoles.describe(
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
              tokenFactoryCreate: z
                .boolean()
                .describe("Whether the user can create token factories"),
              tokenCreate: z
                .boolean()
                .describe("Whether the user can create tokens"),
              addonFactoryCreate: z
                .boolean()
                .describe("Whether the user can create addon factories"),
              addonCreate: z
                .boolean()
                .describe("Whether the user can create addons"),
              grantRole: z
                .boolean()
                .describe("Whether the user can grant roles"),
              revokeRole: z
                .boolean()
                .describe("Whether the user can revoke roles"),
              complianceModuleCreate: z
                .boolean()
                .describe("Whether the user can create compliance modules"),
              identityRegister: z
                .boolean()
                .describe("Whether the user can register identities"),
              identityList: z
                .boolean()
                .describe("Whether the user can read identities"),
              trustedIssuerCreate: z
                .boolean()
                .describe("Whether the user can create trusted issuers"),
              trustedIssuerUpdate: z
                .boolean()
                .describe("Whether the user can update trusted issuers"),
              trustedIssuerDelete: z
                .boolean()
                .describe("Whether the user can delete trusted issuers"),
              topicCreate: z
                .boolean()
                .describe("Whether the user can create topics"),
              topicUpdate: z
                .boolean()
                .describe("Whether the user can update topics"),
              topicDelete: z
                .boolean()
                .describe("Whether the user can delete topics"),
              claimCreate: z
                .boolean()
                .describe("Whether the user can create claims"),
              claimList: z
                .boolean()
                .describe("Whether the user can list claims"),
              claimRevoke: z
                .boolean()
                .describe("Whether the user can revoke claims"),
            };
            return actionsSchema;
          })()
        )
        .describe("The actions on the system the user is allowed to execute"),
    })
    .optional()
    .describe("The permissions of the user for the system"),
});

export type System = z.infer<typeof SystemSchema>;
