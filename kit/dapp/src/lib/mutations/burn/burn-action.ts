"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { burnFunction } from "./burn-function";
import { BurnSchema } from "./burn-schema";

export const burn = action
  .schema(BurnSchema())
  .outputSchema(t.Hashes())
  .action(burnFunction);
