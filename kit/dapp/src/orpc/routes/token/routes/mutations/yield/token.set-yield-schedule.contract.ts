import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenSetYieldScheduleInputSchema } from "@/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { eventIterator } from "@orpc/server";

export const tokenSetYieldScheduleContract = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/set-yield-schedule",
    description: "Set the yield schedule for a yield-bearing token",
    successDescription: "Yield schedule updated successfully",
    tags: ["token"],
  })
  .input(TokenSetYieldScheduleInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));
