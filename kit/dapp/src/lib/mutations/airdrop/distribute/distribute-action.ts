"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { distributeFunction } from "./distribute-function";
import { distributeSchema } from "./distribute-schema";

export const distribute = action
  .schema(distributeSchema)
  .outputSchema(t.Number())
  .action(distributeFunction);
