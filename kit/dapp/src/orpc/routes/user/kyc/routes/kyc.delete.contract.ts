import { baseContract } from "@/orpc/procedures/base.contract";
import {
  KycDeleteInputSchema,
  KycDeleteOutputSchema,
} from "./kyc.delete.schema";

export const kycDeleteContract = baseContract
  .route({
    method: "DELETE",
    path: "/user/{userId}/kyc/remove",
    description: "Delete a user's KYC profile",
    successDescription: "KYC profile deleted",
    tags: ["user", "kyc"],
  })
  .input(KycDeleteInputSchema)
  .output(KycDeleteOutputSchema);
