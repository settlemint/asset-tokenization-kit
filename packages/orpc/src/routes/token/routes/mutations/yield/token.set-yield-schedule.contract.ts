import { baseContract } from "@/procedures/base.contract";
import { TokenSchema } from "@/routes/token/routes/token.read.schema";
import { TokenSetYieldScheduleInputSchema } from "./token.set-yield-schedule.schema";

export const tokenSetYieldScheduleContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/set-yield-schedule",
    description: "Set the yield schedule for a yield-bearing token",
    successDescription: "Yield schedule updated successfully",
    tags: ["token"],
  })
  .input(TokenSetYieldScheduleInputSchema)
  .output(TokenSchema);
