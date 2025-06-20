"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { approveFunction } from "./approve-function";
import { ApproveSchema } from "./approve-schema";

export const approve = action
  .schema(ApproveSchema())
  .outputSchema(t.Hashes())
  .action(approveFunction);
