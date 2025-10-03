import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

export const FixedYieldScheduleClaimInputSchema =
  MutationInputSchemaWithContract;

export const FixedYieldScheduleClaimOutputSchema = z.object({
  transactionHash: z
    .string()
    .describe("The transaction hash of the claim operation"),
});

export type FixedYieldScheduleClaimInput = z.infer<
  typeof FixedYieldScheduleClaimInputSchema
>;

export type FixedYieldScheduleClaimOutput = z.infer<
  typeof FixedYieldScheduleClaimOutputSchema
>;
