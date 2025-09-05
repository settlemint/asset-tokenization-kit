import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FixedYieldScheduleTopUpInputSchema,
  FixedYieldScheduleTopUpOutputSchema,
} from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.top-up.schema";

/**
 * ORPC contract definition for the fixed yield schedule top up endpoint.
 *
 * This contract defines the HTTP route specification, input/output validation,
 * and OpenAPI metadata for topping up the denomination asset in an existing
 * fixed yield schedule contract.
 *
 * The contract specifies:
 * - REST API route pattern for top up operation
 * - Input validation for amount and contract address
 * - Output validation for transaction hash
 * - OpenAPI documentation tags and descriptions
 */
export const fixedYieldScheduleTopUpContract = baseContract
  .route({
    method: "POST",
    path: "/fixed-yield-schedule/top-up",
    description: "Top up the denomination asset in a fixed yield schedule",
    successDescription: "Denomination asset topped up successfully",
    tags: ["fixed-yield-schedule"],
  })
  .input(FixedYieldScheduleTopUpInputSchema)
  .output(FixedYieldScheduleTopUpOutputSchema);
