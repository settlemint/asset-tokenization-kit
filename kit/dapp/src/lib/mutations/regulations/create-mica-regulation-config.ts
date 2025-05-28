import { db } from "@/lib/db";
import {
  micaRegulationConfigs,
  type NewMicaRegulationConfig,
} from "@/lib/db/regulations/schema-mica-regulation-configs";

export async function createMicaRegulationConfig(
  input: NewMicaRegulationConfig
) {
  try {
    const result = await db
      .insert(micaRegulationConfigs)
      .values(input)
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error creating MiCA regulation config:", error);
    throw new Error("Failed to create MiCA regulation config");
  }
}
