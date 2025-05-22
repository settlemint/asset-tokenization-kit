"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { withdrawFunction } from "./withdraw-function";
import { WithdrawSchema } from "./withdraw-schema";

/**
 * Withdraw action to handle withdrawing tokens or underlying assets from contracts
 */
export const withdraw = action
  .schema(WithdrawSchema())
  .outputSchema(t.Hashes())
  .action(withdrawFunction);
