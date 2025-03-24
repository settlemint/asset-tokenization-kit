"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { transferAssetFunction } from "./transfer-function";
import { getTransferFormSchema } from "./transfer-schema";

export const transferAsset = action
  .schema(getTransferFormSchema())
  .outputSchema(t.Hashes())
  .action(transferAssetFunction);
