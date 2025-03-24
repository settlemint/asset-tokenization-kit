"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { unblockUserFunction } from "./unblock-user-function";
import { UnblockUserSchema } from "./unblock-user-schema";

/**
 * Unblock user action to handle unblocking users from tokens
 */
export const unblockUser = action
  .schema(UnblockUserSchema())
  .outputSchema(t.Hashes())
  .action(unblockUserFunction);
