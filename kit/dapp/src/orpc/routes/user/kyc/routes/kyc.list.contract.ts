import { baseContract } from "@/orpc/procedures/base.contract";
import { KycListInputSchema, KycListOutputSchema } from "./kyc.list.schema";

export const kycListContract = baseContract
  .route({
    method: "GET",
    path: "/user/kyc/list",
    description: "List KYC profiles for a user",
    successDescription: "List of KYC profiles",
    tags: ["kyc"],
  })
  .input(KycListInputSchema)
  .output(KycListOutputSchema);
