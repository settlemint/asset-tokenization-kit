import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FixedYieldScheduleWithdrawInputSchema,
  FixedYieldScheduleWithdrawOutputSchema,
} from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.withdraw.schema";

/**
 * ORPC contract definition for the fixed yield schedule withdraw endpoint.
 *
 * This contract defines the HTTP route specification, input/output validation,
 * and OpenAPI metadata for withdrawing the denomination asset from an existing
 * fixed yield schedule contract.
 *
 * The contract specifies:
 * - REST API route pattern for withdraw operation
 * - Input validation for amount, recipient address, and contract address
 * - Output validation for transaction hash
 * - OpenAPI documentation tags and descriptions
 */
export const fixedYieldScheduleWithdrawContract = baseContract
  .route({
    method: "POST",
    path: "/fixed-yield-schedule/{contract}/withdraw",
    description: "Withdraw the denomination asset from a fixed yield schedule",
    successDescription: "Denomination asset withdrawn successfully",
    tags: ["fixed-yield-schedule"],
  })
  .input(FixedYieldScheduleWithdrawInputSchema)
  .output(FixedYieldScheduleWithdrawOutputSchema);
