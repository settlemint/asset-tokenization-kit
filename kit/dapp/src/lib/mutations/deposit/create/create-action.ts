"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createDepositFunction } from "./create-function";
import { CreateDepositSchema } from "./create-schema";

export const createDeposit = action
  .schema(CreateDepositSchema())
  .outputSchema(t.Hashes())
  .action(createDepositFunction);
