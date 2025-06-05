"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { claimAirdropFunction } from "./claim-function";
import { ClaimAirdropSchema } from "./claim-schema";

export const claimAirdrop = action
  .schema(ClaimAirdropSchema)
  .outputSchema(t.Number())
  .action(claimAirdropFunction);
