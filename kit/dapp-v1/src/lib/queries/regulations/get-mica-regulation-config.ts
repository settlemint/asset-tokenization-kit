import { db } from "@/lib/db";
import { micaRegulationConfigs } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { eq } from "drizzle-orm";

export async function getMicaRegulationConfig(regulationConfigId: string) {
  try {
    const result = await db
      .select()
      .from(micaRegulationConfigs)
      .where(eq(micaRegulationConfigs.regulationConfigId, regulationConfigId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching MiCA regulation config:", error);
    throw new Error("Failed to fetch MiCA regulation config");
  }
}
