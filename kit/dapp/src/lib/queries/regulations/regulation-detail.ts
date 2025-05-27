import "server-only";

import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import type { Address } from "viem";

// Helper function to transform snake_case response to camelCase
function transformMicaConfig(config: any): MicaRegulationConfig | null {
  if (!config) {
    return null;
  }

  // Handle reserve_composition - it might be a string (needs parsing) or object (already parsed)
  let reserveComposition = null;
  if (config.reserve_composition) {
    if (typeof config.reserve_composition === "string") {
      try {
        reserveComposition = JSON.parse(config.reserve_composition);
      } catch (error) {
        console.warn("Failed to parse reserve_composition as JSON:", error);
        reserveComposition = null;
      }
    } else if (typeof config.reserve_composition === "object") {
      // Already an object, use as-is
      reserveComposition = config.reserve_composition;
    }
  }

  return {
    id: config.id,
    regulationConfigId: config.regulation_config_id,
    documents: config.documents,
    reserveComposition,
    lastAuditDate: config.last_audit_date
      ? new Date(config.last_audit_date)
      : null,
    reserveStatus: config.reserve_status,
    tokenType: config.token_type,
    legalEntity: config.legal_entity,
    managementVetting: config.management_vetting,
    regulatoryApproval: config.regulatory_approval,
    euPassportStatus: config.eu_passport_status,
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
 * Map of regulation type to their specific GraphQL queries
 */
const RegulationTypeQueries = {
  mica: hasuraGraphql(
    `
    query MicaRegulationDetail($regulationConfigId: String!) {
      mica_regulation_configs(
        where: {
          regulation_config_id: { _eq: $regulationConfigId }
        },
        limit: 1
      ) {
        id
        regulation_config_id
        documents
        reserve_composition
        last_audit_date
        reserve_status
        token_type
        legal_entity
        management_vetting
        regulatory_approval
        eu_passport_status
      }
    }
  `
  ),
  // Add more regulation type queries here as needed
} as const;

/**
 * Map of regulation type to their specific config field names in the response
 */
const RegulationTypeConfigFields = {
  mica: "mica_regulation_configs",
  // Add more regulation type field names here as needed
} as const;

/**
 * Props interface for regulation detail components
 */
export interface RegulationDetailProps {
  /** Asset ID to fetch regulation for */
  assetId: Address;
  /** Type of regulation to fetch */
  regulationType: keyof typeof RegulationTypeQueries;
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
  mica_regulation_config?: MicaRegulationConfig;
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

      const specificQuery = RegulationTypeQueries[regulationType];
      const configField = RegulationTypeConfigFields[regulationType];

      if (!specificQuery || !configField) {
        return null;
      }

      const specificResponse = await hasuraClient.request(
        specificQuery,
        {
          regulationConfigId: baseConfig.id,
        },
        {
          "X-GraphQL-Operation-Name": `${regulationType}RegulationDetail`,
          "X-GraphQL-Operation-Type": "query",
        }
      );

      if (specificResponse[configField].length === 0) {
        return null;
      }

      // Transform the response to match the expected types
      const transformedConfig = transformMicaConfig(
        specificResponse[configField][0]
      );

      return {
        ...baseConfig,
        [`${regulationType}_regulation_config`]: transformedConfig,
      } as RegulationDetailResponse;
    } catch (error) {
      console.error("Error fetching regulation detail:", error);
      return null;
    }
  }
);
