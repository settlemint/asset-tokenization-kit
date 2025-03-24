"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { pauseFunction } from "./pause-function";
import { PauseSchema } from "./pause-schema";

export const pause = action
  .schema(PauseSchema())
  .outputSchema(t.Hashes())
  .action(pauseFunction);
