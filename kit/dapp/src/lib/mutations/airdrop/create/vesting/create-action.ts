"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { createVestingAirdropFunction } from "./create-function";
import { CreateVestingAirdropSchema } from "./create-schema";

export const createVestingAirdrop = action
  .schema(CreateVestingAirdropSchema)
  .outputSchema(t.Number())
  .action(createVestingAirdropFunction);
