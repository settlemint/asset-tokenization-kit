"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { getSecretCodesFunction } from "./get-secret-codes-function";

export const getSecretCodes = action
  .outputSchema(
    t.Object({ success: t.Boolean(), secretCodes: t.Array(t.String()) })
  )
  .action(getSecretCodesFunction);
