"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { allowUserFunction } from "./allow-user-function";
import { AllowUserSchema } from "./allow-user-schema";

export const allowUser = action
  .schema(AllowUserSchema())
  .outputSchema(t.Hashes())
  .action(allowUserFunction);
