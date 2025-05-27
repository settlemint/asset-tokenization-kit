"use server";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";

// Test GraphQL query to check if we can access the regulation config
const TestGetMicaConfig = hasuraGraphql(`
  query TestGetMicaConfig($id: String!) {
    mica_regulation_configs_by_pk(id: $id) {
      id
      documents
      token_type
      reserve_status
      regulation_config_id
    }
  }
`);

export async function testMicaRegulationConfigAction(regulationId: string) {
  try {
    console.log("Testing access to regulation config:", regulationId);

    const result = await hasuraClient.request(TestGetMicaConfig, {
      id: regulationId,
    });

    console.log("Test query result:", result);

    return {
      success: true,
      data: result.mica_regulation_configs_by_pk,
    };
  } catch (error) {
    console.error("Error testing MiCA regulation config access:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: null,
    };
  }
}
