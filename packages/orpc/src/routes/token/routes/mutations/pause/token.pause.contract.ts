import { baseContract } from "../../../../../procedures/base.contract";
import { TokenPauseInputSchema } from "./token.pause.schema";
import { TokenSchema } from "../../token.read.schema";

export const tokenPauseContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/pause",
    description: "Pause token transfers",
    successDescription: "Token paused successfully",
    tags: ["token"],
  })
  .input(TokenPauseInputSchema)
  .output(TokenSchema);
