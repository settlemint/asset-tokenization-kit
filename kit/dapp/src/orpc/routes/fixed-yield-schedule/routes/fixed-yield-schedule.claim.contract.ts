import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FixedYieldScheduleClaimInputSchema,
  FixedYieldScheduleClaimOutputSchema,
} from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.claim.schema";

export const fixedYieldScheduleClaimContract = baseContract
  .route({
    method: "POST",
    path: "/fixed-yield-schedule/{contract}/claim",
    description: "Claim yield from a fixed yield schedule contract",
    successDescription: "Fixed yield schedule claimed successfully",
    tags: ["fixed-yield-schedule"],
  })
  .input(FixedYieldScheduleClaimInputSchema)
  .output(FixedYieldScheduleClaimOutputSchema);
