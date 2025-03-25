"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { createBondFunction } from "./create-function";
import { CreateBondSchema } from "./create-schema";

export const createBond = action
  .schema(CreateBondSchema())
  .outputSchema(t.Hashes())
  .action(createBondFunction);
