"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "@/lib/utils/typebox";
import { pushAirdropDistributeFunction } from "./push-function";
import { PushAirdropDistributeSchema } from "./push-schema";

export const pushAirdropDistribute = action
  .schema(PushAirdropDistributeSchema)
  .outputSchema(t.Hashes())
  .action(pushAirdropDistributeFunction);
