"use server";

import { action } from "@/lib/mutations/safe-action";
import { t } from "elysia";
import { withdrawTokensFromAirdropFunction } from "./withdraw-token-function";
import { WithdrawTokenFromAirdropSchema } from "./withdraw-token-schema";

export const withdrawTokensFromAirdrop = action
  .schema(WithdrawTokenFromAirdropSchema)
  .outputSchema(t.Number())
  .action(withdrawTokensFromAirdropFunction);
