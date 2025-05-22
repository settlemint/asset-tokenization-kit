"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { matureFunction } from "./mature-function";
import { MatureFormSchema } from "./mature-schema";

export const mature = action
  .schema(MatureFormSchema())
  .outputSchema(t.Hashes())
  .action(matureFunction);
