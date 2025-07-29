import { baseContract } from "@/orpc/procedures/base.contract";
import { IdentityCreateSchema } from "@/orpc/routes/system/identity/routes/identity.create.schema";
import { IdentityRegisterSchema } from "@/orpc/routes/system/identity/routes/identity.register.schema";
import { AccountSchema } from "@/orpc/routes/account/routes/account.read.schema";

const identityCreate = baseContract
  .route({
    method: "POST",
    path: "/system/identity/create",
    description: "Create a new identity for the current user",
    successDescription: "Identity created successfully",
    tags: ["identity"],
  })
  .input(IdentityCreateSchema)
  .output(AccountSchema);

const identityRegister = baseContract
  .route({
    method: "PUT",
    path: "/system/identity/register",
    description: "Register the identity of the current user",
    successDescription: "Identity registered successfully",
    tags: ["identity"],
  })
  .input(IdentityRegisterSchema)
  .output(AccountSchema);

export const identityContract = {
  identityCreate,
  identityRegister,
};
