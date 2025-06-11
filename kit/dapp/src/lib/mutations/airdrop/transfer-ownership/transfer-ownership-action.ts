"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "elysia";
import { airdropTransferOwnershipFunction } from "./transfer-ownership-function";
import { AirdropTransferOwnershipSchema } from "./transfer-ownership-schema";

export const airdropTransferOwnership = action
  .schema(AirdropTransferOwnershipSchema)
  .outputSchema(t.Number())
  .action(airdropTransferOwnershipFunction);
