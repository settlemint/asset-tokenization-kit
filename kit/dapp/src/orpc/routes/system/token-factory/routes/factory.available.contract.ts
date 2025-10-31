import { baseContract } from "@/orpc/procedures/base.contract";
import {
  AvailableInputSchema,
  AvailableOutputSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.available.schema";

export const factoryAvailableContract = baseContract
  .route({
    method: "POST",
    path: "/system/token-factory/available",
    description:
      "Check if a predicted token address is available before deployment",
    successDescription: "Predicted address and availability status",
    tags: ["token-factory"],
  })
  .input(AvailableInputSchema)
  .output(AvailableOutputSchema);
