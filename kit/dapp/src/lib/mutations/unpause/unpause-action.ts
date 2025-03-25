"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { unpauseFunction } from "./unpause-function";
import { UnpauseSchema } from "./unpause-schema";

/**
 * Unpause action to handle unpausing token contracts
 */
export const unpause = action
  .schema(UnpauseSchema())
  .outputSchema(t.Hashes())
  .action(unpauseFunction);
