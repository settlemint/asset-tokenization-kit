import { baseContract } from "@/procedures/base.contract";
import { TokenSchema } from "@/routes/token/routes/token.read.schema";
import { TokenSetCapInputSchema } from "./token.set-cap.schema";

export const tokenSetCapContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/set-cap",
    description: "Set the maximum supply cap for a capped token",
    successDescription: "Token cap updated successfully",
    tags: ["token"],
  })
  .input(TokenSetCapInputSchema)
  .output(TokenSchema);
