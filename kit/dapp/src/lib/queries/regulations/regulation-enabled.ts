"use server";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { normalizeAddress } from "@/lib/utils/typebox/address";
import type { Address } from "viem";

/**
 * GraphQL query to check if a regulation is enabled for an asset
 */
const RegulationEnabled = hasuraGraphql(
  `
  query RegulationEnabled($assetId: String!, $regulationType: String!) {
    regulation_configs(
      where: {
        asset_id: { _eq: $assetId },
        regulation_type: { _eq: $regulationType }
      },
      limit: 1
    ) {
      id
    }
  }
`
);

/**
 * Check if a specific regulation is enabled for an asset
 *
 * @param assetId The ID of the asset to check
 * @param regulationType The type of regulation to check
 * @returns True if the regulation is enabled for this asset
 */
export const isRegulationEnabled = withTracing(
  "queries",
  "isRegulationEnabled",
  async (assetId: string, regulationType: string) => {
    try {
      const response = await hasuraClient.request(
        RegulationEnabled,
        {
          assetId: normalizeAddress(assetId as Address),
          regulationType,
        },
        {
          "X-GraphQL-Operation-Name": "RegulationEnabled",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return response.regulation_configs.length > 0;
    } catch (error) {
      console.error("Error checking if regulation is enabled:", error);
      return false;
    }
  }
);
