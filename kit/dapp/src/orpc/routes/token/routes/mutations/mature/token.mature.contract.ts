import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { TokenMatureInputSchema } from "./token.mature.schema";

export const tokenMatureContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/mature",
    description: "Mature a bond token",
    successDescription: "Bond matured successfully",
    tags: ["token"],
  })
  .input(TokenMatureInputSchema)
  .output(TokenSchema);
