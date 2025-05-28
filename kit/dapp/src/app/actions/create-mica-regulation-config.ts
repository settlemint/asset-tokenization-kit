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

    // Create new regulation config with only the fields that exist in the database
    const newConfig = await createMicaRegulationConfig({
      id: randomUUID(),
      regulationConfigId: input.regulationConfigId,
      tokenType: input.tokenType ?? undefined,
      reserveStatus: input.reserveStatus ?? undefined,
      reserveComposition: input.reserveComposition,
      documents: input.documents,
      lastAuditDate: input.lastAuditDate,
      licenceNumber: input.licenceNumber ?? undefined,
      regulatoryAuthority: input.regulatoryAuthority ?? undefined,
      approvalDate: input.approvalDate ?? undefined,
      approvalDetails: input.approvalDetails ?? undefined,
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
