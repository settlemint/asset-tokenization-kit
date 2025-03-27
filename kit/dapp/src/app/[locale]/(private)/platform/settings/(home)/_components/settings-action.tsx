"use server";

import { setSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { action } from "@/lib/mutations/safe-action";
import { AccessControlError } from "@/lib/utils/access-control";
import { t as tb } from "@/lib/utils/typebox";

const schema = tb.Object({
  baseCurrency: tb.FiatCurrency(),
});

export const updateSettings = action
  .schema(schema)
  .outputSchema(tb.Object({ success: tb.Boolean() }))
  .action(async ({ parsedInput: { baseCurrency }, ctx }) => {
    try {
      await setSetting({
        key: SETTING_KEYS.BASE_CURRENCY,
        value: baseCurrency,
        ctx,
      });
      return { success: true };
    } catch (error) {
      if (error instanceof AccessControlError) {
        throw error;
      }
      throw new Error(
        `Failed to update base currency: ${(error as Error).message}`
      );
    }
  });
