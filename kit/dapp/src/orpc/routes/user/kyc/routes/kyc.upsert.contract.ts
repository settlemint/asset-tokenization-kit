import { baseContract } from "@/orpc/procedures/base.contract";
import {
  KycUpsertInputSchema,
  KycUpsertOutputSchema,
} from "./kyc.upsert.schema";

export const kycUpsertContract = baseContract
  .route({
    method: "POST",
    path: "/user/{userId}/kyc/upsert",
    description: "Create or update a user's KYC profile",
    successDescription: "KYC profile saved",
    tags: ["kyc"],
  })
  .input(KycUpsertInputSchema)
  .output(KycUpsertOutputSchema);
