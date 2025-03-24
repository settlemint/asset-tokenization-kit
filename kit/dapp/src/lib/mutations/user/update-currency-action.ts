"use server";

import { action } from "../safe-action";
import { updateCurrencyFunction } from "./update-currency-function";
import { UpdateCurrencySchema } from "./update-currency-schema";

/**
 * Update currency action to handle user currency preference updates
 */
export const updateCurrency = action
  .schema(UpdateCurrencySchema())
  .action(updateCurrencyFunction);
