"use server";

import { setSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { action } from "@/lib/mutations/safe-action";
import { t as tb } from "@/lib/utils/typebox";

const schema = tb.Object({
  baseCurrency: tb.FiatCurrency(),
});

export const updateSettings = action
  .schema(schema)
  .outputSchema(tb.Object({ success: tb.Boolean() }))
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
