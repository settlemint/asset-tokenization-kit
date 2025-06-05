"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { claimStandardAirdropFunction } from "./create-function";
import { ClaimStandardAirdropSchema } from "./create-schema";

export const claimStandardAirdrop = action
  .schema(ClaimStandardAirdropSchema)
  .outputSchema(t.Number())
  .action(claimStandardAirdropFunction);
