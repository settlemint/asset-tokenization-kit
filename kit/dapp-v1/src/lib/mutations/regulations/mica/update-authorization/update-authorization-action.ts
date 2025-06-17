"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { updateAuthorizationFunction } from "./update-authorization-function";
import { UpdateAuthorizationSchema } from "./update-authorization-schema";

export const updateAuthorization = action
  .schema(UpdateAuthorizationSchema())
  .outputSchema(t.Hashes())
  .action(updateAuthorizationFunction);
