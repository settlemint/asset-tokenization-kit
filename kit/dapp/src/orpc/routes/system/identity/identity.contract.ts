import { baseContract } from "@/orpc/procedures/base.contract";
import { IdentityCreateSchema } from "@/orpc/routes/system/identity/routes/identity.create.schema";
import { IdentityRegisterSchema } from "@/orpc/routes/system/identity/routes/identity.register.schema";
import { AccountSchema } from "@/orpc/routes/account/routes/account.read.schema";

const identityCreate = baseContract
  .route({
    method: "POST",
    path: "/system/identity/create",
    description:
      "Create a new blockchain identity contract for the authenticated user. This is required before registering claims or interacting with regulated tokens",
    successDescription:
      "Identity created successfully with account details including the new identity contract address",
    tags: ["identity"],
  })
  .input(IdentityCreateSchema)
  .output(AccountSchema);

const identityRegister = baseContract
  .route({
    method: "PUT",
    path: "/system/identity/register",
    description:
      "Register identity claims (country, accreditation status) for the current user. Requires an identity contract to be created first",
    successDescription:
      "Identity claims registered successfully with updated account details",
    tags: ["identity"],
  })
  .input(IdentityRegisterSchema)
  .output(AccountSchema);

export const identityContract = {
  identityCreate,
  identityRegister,
};
