"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { claimStandardAirdropFunction } from "./claim-function";
import { ClaimStandardAirdropSchema } from "./claim-schema";

export const claimStandardAirdrop = action
  .schema(ClaimStandardAirdropSchema)
  .outputSchema(t.Number())
  .action(claimStandardAirdropFunction);
