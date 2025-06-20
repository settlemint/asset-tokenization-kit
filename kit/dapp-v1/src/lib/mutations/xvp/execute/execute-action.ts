"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { executeXvpFunction } from "./execute-function";
import { ExecuteXvpSchema } from "./execute-schema";

export const executeXvp = action
  .schema(ExecuteXvpSchema)
  .outputSchema(t.Number())
  .action(executeXvpFunction);
