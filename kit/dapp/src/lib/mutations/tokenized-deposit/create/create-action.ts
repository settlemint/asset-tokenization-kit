"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createTokenizedDepositFunction } from "./create-function";
import { CreateTokenizedDepositSchema } from "./create-schema";

export const createTokenizedDeposit = action
  .schema(CreateTokenizedDepositSchema())
  .outputSchema(t.Hashes())
  .action(createTokenizedDepositFunction);
