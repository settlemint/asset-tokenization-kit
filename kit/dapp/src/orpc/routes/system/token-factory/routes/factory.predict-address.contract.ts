import { baseContract } from "@/orpc/procedures/base.contract";
import {
  PredictAddressInputSchema,
  PredictAddressOutputSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";

export const factoryPredictAddressContract = baseContract
  .route({
    method: "POST",
    path: "/system/token-factory/predict-address",
    description: "Predict the address of a token before deployment",
    successDescription: "Predicted token address",
    tags: ["token-factory"],
  })
  .input(PredictAddressInputSchema)
  .output(PredictAddressOutputSchema);
