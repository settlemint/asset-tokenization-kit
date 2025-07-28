import { baseContract } from "@/orpc/procedures/base.contract";
import { z } from "zod";
import {
  KycProfileListOutputSchema,
  KycProfileListSchema,
  KycProfilePublicSchema,
  KycProfileUpsertSchema,
  UserIdSchema,
} from "./kyc.schema";

const list = baseContract
  .route({
    method: "GET",
    path: "/user/{userId}/kyc/list",
    description: "List KYC profiles for a user",
    successDescription: "List of KYC profiles",
    tags: ["user", "kyc"],
  })
  .input(KycProfileListSchema)
  .output(KycProfileListOutputSchema);

const read = baseContract
  .route({
    method: "GET",
    path: "/user/{userId}/kyc/read",
    description: "Read a user's KYC profile",
    successDescription: "KYC profile details",
    tags: ["user", "kyc"],
  })
  .input(UserIdSchema)
  .output(KycProfilePublicSchema);

const upsert = baseContract
  .route({
    method: "POST",
    path: "/user/{userId}/kyc/upsert",
    description: "Create or update a user's KYC profile",
    successDescription: "KYC profile saved",
    tags: ["user", "kyc"],
  })
  .input(z.object({ ...UserIdSchema.shape, ...KycProfileUpsertSchema.shape }))
  .output(KycProfilePublicSchema);

const remove = baseContract
  .route({
    method: "DELETE",
    path: "/user/{userId}/kyc/remove",
    description: "Delete a user's KYC profile",
    successDescription: "KYC profile deleted",
    tags: ["user", "kyc"],
  })
  .input(UserIdSchema)
  .output(UserIdSchema);

export const kycContract = {
  list,
  read,
  upsert,
  remove,
};
