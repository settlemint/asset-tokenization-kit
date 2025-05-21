"use server";

import type { User } from "@/lib/auth/types";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { UpdateReservesInput } from "./update-reserves-schema";

const ASSET_FIELDS = [
  "bankDeposits",
  "governmentBonds",
  "liquidAssets",
  "corporateBonds",
  "centralBankAssets",
  "commodities",
  "otherAssets",
] as const;

type AssetFields = (typeof ASSET_FIELDS)[number];

// Helper to calculate total from asset percentages
const calculateTotal = (value: Partial<Record<AssetFields, number>>) => {
  return ASSET_FIELDS.reduce((sum, field) => sum + (value[field] || 0), 0);
};

// GraphQL query to get regulation config ID
/*
 * Note: Currently we need to make 3 separate requests because the relationship between
 * regulation_configs and mica_regulation_configs is not exposed in the Hasura GraphQL schema.
 *
 * To optimize this into a single query, the relationship needs to be added in Hasura.
 * This can be done by adding metadata management to the SettleMint SDK,
 * and then passing the metadata to the createHasuraClient function:
 *    ```typescript
 *    // In lib/settlemint/hasura.ts
 *    const hasuraClient = createHasuraClient<typeof introspection>({
 *      metadata: {
 *        relationships: [{
 *          table: "regulation_configs",
 *          name: "mica_regulation_config",
 *          using: {
 *            foreign_key_constraint_on: {
 *              column: "regulation_config_id",
 *              table: "mica_regulation_configs"
 *            }
 *          }
 *        }]
 *      }
 *    });
 *    ```
 *
 * Once the relationship is added, we could use this optimized query:
 * ```graphql
 * query GetMicaConfig($assetId: String!) {
 *   regulation_configs(
 *     where: {
 *       asset_id: { _eq: $assetId },
 *       regulation_type: { _eq: "mica" }
 *     },
 *     limit: 1
 *   ) {
 *     id
 *     mica_regulation_config {
 *       id
 *     }
 *   }
 * }
 * ```
 *
 * This would eliminate the need for the second query (GetMicaRegulationConfigId).
 */
const GetRegulationConfigId = hasuraGraphql(`
  query GetRegulationConfigId($assetId: String!) {
    regulation_configs(
      where: {
        asset_id: { _eq: $assetId },
        regulation_type: { _eq: "mica" }
      },
      limit: 1
    ) {
      id
    }
  }
`);

// GraphQL query to get MICA regulation config ID
const GetMicaRegulationConfigId = hasuraGraphql(`
  query GetMicaRegulationConfigId($regulationConfigId: String!) {
    mica_regulation_configs(
      where: {
        regulation_config_id: { _eq: $regulationConfigId }
      },
      limit: 1
    ) {
      id
    }
  }
`);

type GetRegulationConfigIdResponse = {
  regulation_configs: {
    id: string;
  }[];
};

type GetMicaRegulationConfigIdResponse = {
  mica_regulation_configs: {
    id: string;
  }[];
};

// GraphQL mutation for updating MICA regulation config
const UpdateMicaRegulationConfig = hasuraGraphql(`
  mutation UpdateMicaRegulationConfig(
    $id: String!
    $reserveComposition: jsonb!
    $lastAuditDate: timestamptz!
    $reserveStatus: String!
    $tokenType: String!
  ) {
    update_mica_regulation_configs_by_pk(
      pk_columns: { id: $id }
      _set: {
        reserve_composition: $reserveComposition
        last_audit_date: $lastAuditDate
        reserve_status: $reserveStatus
        token_type: $tokenType
      }
    ) {
      id
      reserve_composition
      last_audit_date
      reserve_status
      token_type
    }
  }
`);

export const updateReservesFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput,
  }: {
    parsedInput: UpdateReservesInput;
    ctx: { user: User };
  }) => {
    // Validate total equals 100%
    const total = calculateTotal(parsedInput);
    if (total !== 100) {
      throw new Error("Total percentage of all assets must equal 100%");
    }

    // Get the regulation config ID for this asset
    const regulationConfigResult =
      await hasuraClient.request<GetRegulationConfigIdResponse>(
        GetRegulationConfigId,
        {
          assetId: parsedInput.address,
        }
      );

    const regulationConfig = regulationConfigResult.regulation_configs[0];
    if (!regulationConfig?.id) {
      throw new Error("Regulation config not found for this asset");
    }

    // Get the MICA regulation config ID
    const micaConfigResult =
      await hasuraClient.request<GetMicaRegulationConfigIdResponse>(
        GetMicaRegulationConfigId,
        {
          regulationConfigId: regulationConfig.id,
        }
      );

    const micaConfig = micaConfigResult.mica_regulation_configs[0];
    if (!micaConfig?.id) {
      throw new Error("MICA regulation config not found for this asset");
    }

    const reserveComposition: NonNullable<
      MicaRegulationConfig["reserveComposition"]
    > = {
      bankDeposits: parsedInput.bankDeposits,
      governmentBonds: parsedInput.governmentBonds,
      highQualityLiquidAssets: parsedInput.liquidAssets,
      corporateBonds: parsedInput.corporateBonds,
      centralBankAssets: parsedInput.centralBankAssets,
      commodities: parsedInput.commodities,
      otherAssets: parsedInput.otherAssets,
    };

    // Update the MICA regulation config in the database using Hasura
    const result = await hasuraClient.request(UpdateMicaRegulationConfig, {
      id: micaConfig.id,
      reserveComposition: JSON.stringify(reserveComposition),
      lastAuditDate: new Date(parsedInput.lastAuditDate).toISOString(),
      reserveStatus: parsedInput.reserveStatus,
      tokenType: parsedInput.tokenType,
    });

    if (!result.update_mica_regulation_configs_by_pk) {
      throw new Error("Failed to update MICA regulation config");
    }

    return safeParse(t.Hashes(), []);
  }
);
