"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createXvpFunction } from "./create-function";
import { CreateXvpSchema } from "./create-schema";

export const createXvp = action
  .schema(CreateXvpSchema)
  .outputSchema(t.Number())
  .action(createXvpFunction);
