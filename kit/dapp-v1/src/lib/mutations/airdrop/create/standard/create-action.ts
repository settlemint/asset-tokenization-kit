"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { createStandardAirdropFunction } from "./create-function";
import { CreateStandardAirdropSchema } from "./create-schema";

export const createStandardAirdrop = action
  .schema(CreateStandardAirdropSchema)
  .outputSchema(t.Number())
  .action(createStandardAirdropFunction);
