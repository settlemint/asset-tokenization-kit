"use server";

import type { NewMicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { createMicaRegulationConfig } from "@/lib/mutations/regulations/create-mica-regulation-config";
import { getMicaRegulationConfig } from "@/lib/queries/regulations/get-mica-regulation-config";
import { randomUUID } from "crypto";

export async function createMicaRegulationConfigAction(
  input: Omit<NewMicaRegulationConfig, "id">
) {
  try {
    // Check if config already exists
    const existingConfig = await getMicaRegulationConfig(
      input.regulationConfigId
    );

    if (existingConfig) {
      return {
        success: false,
        error: "MiCA regulation config already exists for this asset",
        data: existingConfig,
      };
    }

    // Create new regulation config
    const newConfig = await createMicaRegulationConfig({
      id: randomUUID(),
      regulation_config_id: input.regulationConfigId,
      token_type: input.tokenType ?? undefined,
      reserve_status: input.reserveStatus ?? undefined,
      legal_entity: input.legalEntity
        ? JSON.stringify(input.legalEntity)
        : null,
      regulatory_approval: input.regulatoryApproval
        ? JSON.stringify(input.regulatoryApproval)
        : null,
      reserve_composition: input.reserveComposition
        ? JSON.stringify(input.reserveComposition)
        : null,
      management_vetting: input.managementVetting
        ? JSON.stringify(input.managementVetting)
        : null,
      eu_passport_status: input.euPassportStatus
        ? JSON.stringify(input.euPassportStatus)
        : null,
      documents: input.documents ? JSON.stringify(input.documents) : null,
      last_audit_date: input.lastAuditDate,
    });

    return {
      success: true,
      data: newConfig,
    };
  } catch (error) {
    console.error("Error creating MiCA regulation config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
