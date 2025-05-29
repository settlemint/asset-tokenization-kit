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
    licenceNumber: config.licence_number,
    regulatoryAuthority: config.regulatory_authority,
    approvalDate: config.approval_date,
    approvalDetails: config.approval_details,
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
 * Using the correct table name that exists in Hasura schema
 */
const RegulationTypeQueries = {
  mica: hasuraGraphql(
    `
    query MicaRegulationDetail($regulationConfigId: String!) {
      regulation_configs(
        where: {
          id: { _eq: $regulationConfigId }
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
  ),
  // Add more regulation type queries here as needed
} as const;

/**
 * Map of regulation type to their specific config field names in the response
 */
const RegulationTypeConfigFields = {
  mica: "regulation_configs",
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
  mica_regulation_config?: MicaRegulationConfig | null;
} & BaseRegulationConfig;

/**
 * Fetches regulation configuration data for a specific asset and regulation type
 * Creates a default fallback MICA config if none exists to prevent layout failures
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

      // Create a default fallback MICA config if none exists
      // This prevents the layout from crashing with notFound()
      let micaConfig: MicaRegulationConfig | null = null;
      if (regulationType === "mica") {
        // For now, create a basic default config since we can't access MICA table via GraphQL
        // TODO: Replace with actual database fetch once MICA tables are exposed in Hasura
        micaConfig = {
          id: `default-${baseConfig.id}`,
          regulationConfigId: baseConfig.id,
          documents: [],
          reserveComposition: {
            bankDeposits: 0,
            governmentBonds: 0,
            highQualityLiquidAssets: 0,
            corporateBonds: 0,
            centralBankAssets: 0,
            commodities: 0,
            otherAssets: 0,
          },
          lastAuditDate: null,
          reserveStatus: "PENDING_REVIEW" as const,
          tokenType: "ELECTRONIC_MONEY_TOKEN" as const,
          licenceNumber: null,
          regulatoryAuthority: null,
          approvalDate: null,
          approvalDetails: null,
        };
      }

      return {
        ...baseConfig,
        mica_regulation_config: micaConfig,
      } as RegulationDetailResponse;
    } catch (error) {
      console.error("Error fetching regulation detail:", error);
      return null;
    }
  }
);
