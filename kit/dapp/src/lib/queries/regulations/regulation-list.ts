"use server";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";

/**
 * GraphQL query to fetch all regulations for an asset
 */
const RegulationList = hasuraGraphql(
  `
  query RegulationList($assetId: String!) {
    regulation_configs(
      where: { asset_id: { _eq: $assetId } }
    ) {
      id
      regulation_type
      status
      created_at
      updated_at
    }
  }
`
);

export interface RegulationListProps {
  assetId: string;
}

/**
 * Fetches all regulations for a specific asset
 *
 * @param params - Object containing the assetId
 * @returns Array of regulations with their status
 */
export const getRegulationList = withTracing(
  "queries",
  "getRegulationList",
  async ({ assetId }: RegulationListProps) => {
    try {
      const response = await hasuraClient.request(
        RegulationList,
        { assetId },
        {
          "X-GraphQL-Operation-Name": "RegulationList",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return response.regulation_configs;
    } catch (error) {
      console.error("Error fetching regulations:", error);
      return [];
    }
  }
);
