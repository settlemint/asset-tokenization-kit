"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { freezeFunction } from "./freeze-function";
import { FreezeSchema } from "./freeze-schema";

export const freeze = action
  .schema(FreezeSchema())
  .outputSchema(t.Hashes())
  .action(freezeFunction);
