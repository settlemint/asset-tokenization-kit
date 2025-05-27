"use server";

import { getMicaRegulationConfig } from "@/lib/queries/regulations/get-mica-regulation-config";

export async function getMicaRegulationConfigAction(assetAddress: string) {
  try {
    const regulationConfig = await getMicaRegulationConfig(
      assetAddress.toLowerCase()
    );

    return {
      success: true,
      data: regulationConfig,
    };
  } catch (error) {
    console.error("Error fetching MiCA regulation config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: null,
    };
  }
}
