import { baseContract } from "../../../../../procedures/base.contract";
import { TokenRecoverERC20InputSchema } from "./token.recover-erc20.schema";
import { TokenSchema } from "../../token.read.schema";

export const tokenRecoverERC20Contract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/recover-erc20",
    description: "Recover mistakenly sent ERC20 tokens from the contract",
    successDescription: "ERC20 tokens recovered successfully",
    tags: ["token"],
  })
  .input(TokenRecoverERC20InputSchema)
  .output(TokenSchema);
