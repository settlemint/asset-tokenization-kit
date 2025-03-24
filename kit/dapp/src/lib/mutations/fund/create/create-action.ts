"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createFundFunction } from "./create-function";
import { CreateFundSchema } from "./create-schema";

export const createFund = action
  .schema(CreateFundSchema())
  .outputSchema(t.Hashes())
  .action(createFundFunction);
