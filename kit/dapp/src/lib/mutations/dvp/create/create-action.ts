"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createDvpSwapFunction } from "./create-function";
import { CreateDvpSwapSchema } from "./create-schema";

export const createDvpSwap = action
  .schema(CreateDvpSwapSchema)
  .outputSchema(t.Hashes())
  .action(createDvpSwapFunction);
