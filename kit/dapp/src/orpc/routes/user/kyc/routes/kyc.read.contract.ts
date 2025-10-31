import { baseContract } from "@/orpc/procedures/base.contract";
import { KycReadInputSchema, KycReadOutputSchema } from "./kyc.read.schema";

export const kycReadContract = baseContract
  .route({
    method: "GET",
    path: "/user/{userId}/kyc/read",
    description: "Read a user's KYC profile",
    successDescription: "KYC profile details",
    tags: ["kyc"],
  })
  .input(KycReadInputSchema)
  .output(KycReadOutputSchema);
