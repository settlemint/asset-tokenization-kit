import "server-only";

import { db } from "@/lib/db";
import type { MicaRegulationConfigResponse } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { micaRegulationConfigs } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { eq } from "drizzle-orm";
import type { Address } from "viem";

// Helper function to transform snake_case response to camelCase
function transformMicaConfig(config: any): MicaRegulationConfigResponse | null {
  if (!config) {
    return null;
  }

  // Handle reserve_composition - it might be a string (needs parsing) or object (already parsed)
  let reserveComposition = null;
  if (config.reserveComposition || config.reserve_composition) {
    const composition = config.reserveComposition || config.reserve_composition;
    if (typeof composition === "string") {
      try {
        reserveComposition = JSON.parse(composition);
      } catch (error) {
        console.warn("Failed to parse reserve_composition as JSON:", error);
        reserveComposition = null;
      }
    } else if (typeof composition === "object") {
      // Already an object, use as-is
      reserveComposition = composition;
    }
  }

  // Create regulatory approval object from flattened fields for backward compatibility
  const regulatoryApproval =
    config.licenceNumber ||
    config.regulatoryAuthority ||
    config.approvalDate ||
    config.approvalDetails
      ? {
          licenceNumber: config.licenceNumber,
          regulatoryAuthority: config.regulatoryAuthority,
          approvalDate: config.approvalDate
            ? new Date(config.approvalDate).getTime()
            : undefined,
          approvalDetails: config.approvalDetails,
        }
      : null;

  return {
    id: config.id,
    regulationConfigId:
      config.regulationConfigId || config.regulation_config_id,
    documents: config.documents,
    reserveComposition,
    lastAuditDate:
      config.lastAuditDate || config.last_audit_date
        ? new Date(config.lastAuditDate || config.last_audit_date)
        : null,
    reserveStatus: config.reserveStatus || config.reserve_status,
    tokenType: config.tokenType || config.token_type,
    // Provide null for missing fields to maintain interface compatibility
    legalEntity: null,
    managementVetting: null,
    regulatoryApproval,
    euPassportStatus: null,
  };
}

/**
 * GraphQL query to fetch base regulation details from Hasura
 */
const RegulationDetail = hasuraGraphql(
  `
  query RegulationDetail($assetId: String!, $regulationType: String!) {
    regulation_configs(
      where: {
        asset_id: { _eq: $assetId },
        regulation_type: { _eq: $regulationType }
      },
      limit: 1
    ) {
      id
      asset_id
      regulation_type
      status
      created_at
      updated_at
    }
  }
`
);

/**
 * Props interface for regulation detail components
 */
export interface RegulationDetailProps {
  /** Asset ID to fetch regulation for */
  assetId: Address;
  /** Type of regulation to fetch */
  regulationType: "mica";
}

type BaseRegulationConfig = {
  id: string;
  asset_id: string;
  regulation_type: string;
  status: string;
  created_at: unknown;
  updated_at: unknown;
};

type RegulationDetailResponse = {
  mica_regulation_config?: MicaRegulationConfigResponse | null;
} & BaseRegulationConfig;

/**
 * Fetches regulation configuration data for a specific asset and regulation type
 *
 * @param params - Object containing the assetId and regulationType
 * @returns Regulation configuration data if found, null if not found
 */
export const getRegulationDetail = withTracing(
  "queries",
  "getRegulationDetail",
  async ({
    assetId,
    regulationType,
  }: RegulationDetailProps): Promise<RegulationDetailResponse | null> => {
    try {
      const baseResponse = await hasuraClient.request(
        RegulationDetail,
        {
          assetId,
          regulationType,
        },
        {
          "X-GraphQL-Operation-Name": "RegulationDetail",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      if (baseResponse.regulation_configs.length === 0) {
        return null;
      }

      const baseConfig = baseResponse.regulation_configs[0];

      // For MICA regulation type, use Drizzle ORM to query the specific config
      // This bypasses the GraphQL schema issue
      if (regulationType === "mica") {
        try {
          const micaConfigResult = await db
            .select({
              id: micaRegulationConfigs.id,
              regulationConfigId: micaRegulationConfigs.regulationConfigId,
              documents: micaRegulationConfigs.documents,
              reserveComposition: micaRegulationConfigs.reserveComposition,
              lastAuditDate: micaRegulationConfigs.lastAuditDate,
              reserveStatus: micaRegulationConfigs.reserveStatus,
              tokenType: micaRegulationConfigs.tokenType,
              licenceNumber: micaRegulationConfigs.licenceNumber,
              regulatoryAuthority: micaRegulationConfigs.regulatoryAuthority,
              approvalDate: micaRegulationConfigs.approvalDate,
              approvalDetails: micaRegulationConfigs.approvalDetails,
            })
            .from(micaRegulationConfigs)
            .where(eq(micaRegulationConfigs.regulationConfigId, baseConfig.id))
            .limit(1);

          if (micaConfigResult.length === 0) {
            return {
              ...baseConfig,
              mica_regulation_config: null,
            } as RegulationDetailResponse;
          }

          // Transform the response to match the expected types
          const transformedConfig = transformMicaConfig(micaConfigResult[0]);

          return {
            ...baseConfig,
            mica_regulation_config: transformedConfig,
          } as RegulationDetailResponse;
        } catch (dbError) {
          console.error("Error fetching MICA config from database:", dbError);
          // Return the base config without the specific config if DB query fails
          return {
            ...baseConfig,
            mica_regulation_config: null,
          } as RegulationDetailResponse;
        }
      }

      // For other regulation types (when they're added), handle them here
      return {
        ...baseConfig,
      } as RegulationDetailResponse;
    } catch (error) {
      console.error("Error fetching regulation detail:", error);
      return null;
    }
  }
);
