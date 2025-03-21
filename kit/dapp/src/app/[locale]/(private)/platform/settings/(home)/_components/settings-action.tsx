"use server";

import { setSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { action } from "@/lib/mutations/safe-action";
import { z } from "@/lib/utils/zod";

const schema = z.object({
  baseCurrency: z.fiatCurrency(),
});

export const updateSettings = action
  .schema(schema)
  .outputSchema(z.object({ success: z.boolean() }))
  .action(async ({ parsedInput: { baseCurrency } }) => {
    try {
      await setSetting(SETTING_KEYS.BASE_CURRENCY, baseCurrency);
      return { success: true };
    } catch (error) {
      throw new Error(
        `Failed to update base currency: ${(error as Error).message}`
      );
    }
  });
