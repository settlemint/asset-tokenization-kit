import { baseContract } from "@/procedures/base.contract";
import { TokenFreezeAddressInputSchema } from "@/routes/token/routes/mutations/freeze/token.freeze-address.schema";
import { TokenSchema } from "@/routes/token/routes/token.read.schema";

export const tokenFreezeAddressContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/freeze-address",
    description: "Freeze or unfreeze an address from token transfers",
    successDescription: "Address freeze status updated successfully",
    tags: ["token"],
  })
  .input(TokenFreezeAddressInputSchema)
  .output(TokenSchema);
