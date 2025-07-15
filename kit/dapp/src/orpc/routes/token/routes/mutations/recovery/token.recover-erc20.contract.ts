import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenRecoverERC20InputSchema } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-erc20.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenRecoverERC20Contract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/recover-erc20",
    description: "Recover mistakenly sent ERC20 tokens from the contract",
    successDescription: "ERC20 tokens recovered successfully",
    tags: ["token"],
  })
  .input(TokenRecoverERC20InputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
