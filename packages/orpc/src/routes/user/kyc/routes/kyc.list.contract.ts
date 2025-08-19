import { baseContract } from "@/procedures/base.contract";
import { KycListInputSchema, KycListOutputSchema } from "@/routes/user/kyc/routes/kyc.list.schema";

export const kycListContract = baseContract
  .route({
    method: "GET",
    path: "/user/{userId}/kyc/list",
    description: "List KYC profiles for a user",
    successDescription: "List of KYC profiles",
    tags: ["user", "kyc"],
  })
  .input(KycListInputSchema)
  .output(KycListOutputSchema);
