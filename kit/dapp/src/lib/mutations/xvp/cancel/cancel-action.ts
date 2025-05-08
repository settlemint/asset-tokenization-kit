"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { cancelXvpFunction } from "./cancel-function";
import { CancelXvpSchema } from "./cancel-schema";

export const cancelXvp = action
  .schema(CancelXvpSchema)
  .outputSchema(t.Hashes())
  .action(cancelXvpFunction);
