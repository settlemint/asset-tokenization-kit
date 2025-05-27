import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";

export const GET_MICA_REGULATION_CONFIG = hasuraGraphql(`
  query GetMicaRegulationConfig($regulation_config_id: String!) {
    mica_regulation_configs(
      where: { regulation_config_id: { _eq: $regulation_config_id } }
      limit: 1
    ) {
      id
      regulation_config_id
      token_type
      reserve_status
      legal_entity
      regulatory_approval
      reserve_composition
      management_vetting
      eu_passport_status
      documents
      last_audit_date
    }
  }
`);

export async function getMicaRegulationConfig(regulationConfigId: string) {
  try {
    const response = await hasuraClient.request(GET_MICA_REGULATION_CONFIG, {
      regulation_config_id: regulationConfigId,
    });

    return response.mica_regulation_configs[0] || null;
  } catch (error) {
    console.error("Error fetching MiCA regulation config:", error);
    throw new Error("Failed to fetch MiCA regulation config");
  }
}
