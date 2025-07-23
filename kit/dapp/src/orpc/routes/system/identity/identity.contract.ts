import { baseContract } from "@/orpc/procedures/base.contract";
import {
  IdentityCreateOutputSchema,
  IdentityCreateSchema,
} from "@/orpc/routes/system/identity/routes/identity.create.schema";
import { eventIterator } from "@orpc/server";

const identityCreate = baseContract
  .route({
    method: "POST",
    path: "/system/identity/create",
    description: "Create a new identity",
    successDescription: "Identity created successfully",
    tags: ["identity"],
  })
  .input(IdentityCreateSchema)
  .output(eventIterator(IdentityCreateOutputSchema));

export const identityContract = {
  identityCreate,
};
