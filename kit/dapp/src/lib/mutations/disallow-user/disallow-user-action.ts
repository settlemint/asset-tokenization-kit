"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { disallowUserFunction } from "./disallow-user-function";
import { DisallowUserSchema } from "./disallow-user-schema";

export const disallowUser = action
  .schema(DisallowUserSchema())
  .outputSchema(t.Hashes())
  .action(disallowUserFunction);
