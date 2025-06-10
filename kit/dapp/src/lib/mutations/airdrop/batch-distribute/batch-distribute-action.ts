"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { batchDistributeFunction } from "./batch-distribute-function";
import { batchDistributeSchema } from "./batch-distribute-schema";

export const batchDistribute = action
  .schema(batchDistributeSchema)
  .outputSchema(t.Number())
  .action(batchDistributeFunction);
