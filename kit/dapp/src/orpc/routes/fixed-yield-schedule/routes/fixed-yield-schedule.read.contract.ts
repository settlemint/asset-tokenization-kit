import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FixedYieldScheduleReadInputSchema,
  FixedYieldScheduleSchema,
} from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.read.schema";

/**
 * ORPC contract definition for the fixed yield schedule read endpoint.
 *
 * This contract defines the HTTP route specification, input/output validation,
 * and OpenAPI metadata for retrieving fixed yield schedule details by ID.
 * It establishes the type-safe interface between the API consumer and the
 * fixed yield schedule data retrieval functionality.
 *
 * The contract specifies:
 * - REST API route pattern with parameter binding
 * - Input validation for yield schedule ID (Ethereum address)
 * - Output validation for comprehensive yield schedule data
 * - OpenAPI documentation tags and descriptions
 */
export const fixedYieldScheduleReadContract = baseContract
  .route({
    method: "GET",
    path: "/fixed-yield-schedule/{contract}",
    description: "Get a fixed yield schedule by contract address",
    successDescription: "Fixed yield schedule details",
    tags: ["fixed-yield-schedule"],
  })
  .input(FixedYieldScheduleReadInputSchema)
  .output(FixedYieldScheduleSchema);
