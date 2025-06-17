"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { createPushAirdropFunction } from "./create-function";
import { CreatePushAirdropSchema } from "./create-schema";

export const createPushAirdrop = action
  .schema(CreatePushAirdropSchema)
  .outputSchema(t.Number())
  .action(createPushAirdropFunction);
