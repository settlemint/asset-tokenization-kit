"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { revokeRoleFunction } from "./revoke-role-function";
import { RevokeRoleSchema } from "./revoke-role-schema";

export const revokeRole = action
  .schema(RevokeRoleSchema())
  .outputSchema(t.Hashes())
  .action(revokeRoleFunction);
