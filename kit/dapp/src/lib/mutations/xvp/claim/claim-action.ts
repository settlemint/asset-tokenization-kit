"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { claimXvpFunction } from "./claim-function";
import { ClaimXvpSchema } from "./claim-schema";

export const claimXvp = action
  .schema(ClaimXvpSchema)
  .outputSchema(t.Hashes())
  .action(claimXvpFunction);
