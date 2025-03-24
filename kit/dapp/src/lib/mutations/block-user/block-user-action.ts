"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { blockUserFunction } from "./block-user-function";
import { BlockUserSchema } from "./block-user-schema";

export const blockUser = action
  .schema(BlockUserSchema())
  .outputSchema(t.Hashes())
  .action(blockUserFunction);
