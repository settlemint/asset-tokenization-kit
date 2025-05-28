import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";

export const CREATE_MICA_REGULATION_CONFIG = hasuraGraphql(`
  mutation CreateMicaRegulationConfig(
    $object: mica_regulation_configs_insert_input!
  ) {
    insert_mica_regulation_configs_one(object: $object) {
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

export async function createMicaRegulationConfig(input: {
  regulation_config_id: string;
  token_type?: string;
  reserve_status?: string;
  [key: string]: any;
}) {
  try {
    const response = await hasuraClient.request(CREATE_MICA_REGULATION_CONFIG, {
      object: input,
    });

    return response.insert_mica_regulation_configs_one;
  } catch (error) {
    console.error("Error creating MiCA regulation config:", error);
    throw new Error("Failed to create MiCA regulation config");
  }
}
