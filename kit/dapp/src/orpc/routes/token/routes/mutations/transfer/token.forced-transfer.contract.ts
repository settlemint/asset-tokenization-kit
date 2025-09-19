import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenForcedTransferSchema } from "@/orpc/routes/token/routes/mutations/transfer/token.forced-transfer.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";

export const tokenForcedTransferContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/transfer/forced",
    description:
      "Force transfer tokens from specific holders as a custodian (single or batch)",
    successDescription: "Forced transfer executed successfully",
    tags: ["token"],
  })
  .input(TokenForcedTransferSchema)
  .output(TokenSchema);
