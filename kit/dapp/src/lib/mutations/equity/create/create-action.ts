"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createEquityFunction } from "./create-function";
import { CreateEquitySchema } from "./create-schema";

export const createEquity = action
  .schema(CreateEquitySchema())
  .outputSchema(t.Hashes())
  .action(createEquityFunction);
