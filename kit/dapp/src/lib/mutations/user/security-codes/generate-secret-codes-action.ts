"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { generateSecretCodesFunction } from "./generate-secret-codes-function";

export const generateSecretCodes = action
  .outputSchema(t.Object({ secretCodes: t.Array(t.String()) }))
  .action(generateSecretCodesFunction);
