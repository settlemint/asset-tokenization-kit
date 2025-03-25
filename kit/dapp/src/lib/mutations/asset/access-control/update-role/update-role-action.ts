"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { updateRolesFunction } from "./update-role-function";
import { UpdateRolesSchema } from "./update-role-schema";

export const updateRoles = action
  .schema(UpdateRolesSchema())
  .outputSchema(t.Hashes())
  .action(updateRolesFunction);
