"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { grantRoleFunction } from "./grant-role-function";
import { GrantRoleSchema } from "./grant-role-schema";

export const grantRole = action
  .schema(GrantRoleSchema())
  .outputSchema(t.Hashes())
  .action(grantRoleFunction);
