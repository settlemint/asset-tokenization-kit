import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

export const FixedYieldScheduleClaimInputSchema =
  MutationInputSchemaWithContract;

export const FixedYieldScheduleClaimOutputSchema = BaseMutationOutputSchema;

export type FixedYieldScheduleClaimInput = z.infer<
  typeof FixedYieldScheduleClaimInputSchema
>;

export type FixedYieldScheduleClaimOutput = z.infer<
  typeof FixedYieldScheduleClaimOutputSchema
>;
