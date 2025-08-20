import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FixedYieldScheduleCreateInputSchema,
  FixedYieldScheduleCreateOutputSchema,
} from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.create.schema";

/**
 * ORPC contract definition for the fixed yield schedule create endpoint.
 *
 * This contract defines the HTTP route specification, input/output validation,
 * and OpenAPI metadata for creating new fixed yield schedule contracts.
 * It establishes the type-safe interface between the API consumer and the
 * fixed yield schedule creation functionality.
 *
 * The contract specifies:
 * - REST API route pattern for creation
 * - Input validation for yield schedule configuration
 * - Output validation for deployed contract address
 * - OpenAPI documentation tags and descriptions
 */
export const fixedYieldScheduleCreateContract = baseContract
  .route({
    method: "POST",
    path: "/fixed-yield-schedule",
    description: "Create a new fixed yield schedule contract",
    successDescription: "Fixed yield schedule created successfully",
    tags: ["fixed-yield-schedule"],
  })
  .input(FixedYieldScheduleCreateInputSchema)
  .output(FixedYieldScheduleCreateOutputSchema);