import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenFreezeAddressInputSchema } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenFreezeAddressContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/freeze-address",
    description: "Freeze or unfreeze an address from token transfers",
    successDescription: "Address freeze status updated successfully",
    tags: ["token"],
  })
  .input(TokenFreezeAddressInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
