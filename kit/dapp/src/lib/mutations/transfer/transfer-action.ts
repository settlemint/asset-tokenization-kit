"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { transferAssetFunction } from "./transfer-function";
import { TransferSchema } from "./transfer-schema";

/**
 * Transfer action to handle token transfers
 */
export const transfer = action
  .schema(TransferSchema())
  .outputSchema(t.Hashes())
  .action(transferAssetFunction);
