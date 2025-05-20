import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";

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
  assetId: string;
  /** Type of regulation to fetch */
  regulationType: keyof typeof RegulationTypeQueries;
}

/**
 * Fetches regulation configuration data for a specific asset and regulation type
 *
 * @param params - Object containing the assetId and regulationType
 * @returns Regulation configuration data if found, null if not found
 */
export const getRegulationDetail = withTracing(
  "queries",
  "getRegulationDetail",
  async ({ assetId, regulationType }: RegulationDetailProps) => {
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

      return {
        ...baseConfig,
        [`${regulationType}_regulation_config`]:
          specificResponse[configField][0],
      };
    } catch (error) {
      console.error("Error fetching regulation detail:", error);
      return null;
    }
  }
);
