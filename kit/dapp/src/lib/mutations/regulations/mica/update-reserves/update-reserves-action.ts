"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { BaseSchema } from "./update-reserves-schema";

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

export const updateReserves = action
  .schema(BaseSchema)
  .outputSchema(t.Hashes())
  .action(async ({ parsedInput }) => {
    // Validate total equals 100%
    const total = calculateTotal(parsedInput);
    if (total !== 100) {
      throw new Error("Total percentage of all assets must equal 100%");
    }

    // TODO: Implement the actual update logic
    return ["0x123"];
  });
