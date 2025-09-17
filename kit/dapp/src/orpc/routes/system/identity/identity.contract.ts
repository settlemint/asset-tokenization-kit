import { baseContract } from "@/orpc/procedures/base.contract";
import { AccountSchema } from "@/orpc/routes/account/routes/account.read.schema";
import { IdentityCreateSchema } from "@/orpc/routes/system/identity/routes/identity.create.schema";
import {
  IdentityListInputSchema,
  IdentityListOutputSchema,
} from "@/orpc/routes/system/identity/routes/identity.list.schema";
import { IdentityRegisterSchema } from "@/orpc/routes/system/identity/routes/identity.register.schema";
import claimsContract from "@/orpc/routes/system/identity/claims/claims.contract";

const TAGS = ["system", "identity"];

const identityCreate = baseContract
  .route({
    method: "POST",
    path: "/system/identity",
    description:
      "Create a new blockchain identity contract for the authenticated user. This is required before registering claims or interacting with regulated tokens",
    successDescription:
      "Identity created successfully with account details including the new identity contract address",
    tags: TAGS,
  })
  .input(IdentityCreateSchema)
  .output(AccountSchema);

const identityRegister = baseContract
  .route({
    method: "PUT",
    path: "/system/identity",
    description:
      "Register identity claims (country, accreditation status) for the current user. Requires an identity contract to be created first",
    successDescription:
      "Identity claims registered successfully with updated account details",
    tags: TAGS,
  })
  .input(IdentityRegisterSchema)
  .output(AccountSchema);

const identityList = baseContract
  .route({
    method: "GET",
    path: "/system/identity/list",
    description:
      "Retrieve a paginated list of blockchain identities with account metadata, claim counts, and registry association for administrative views.",
    successDescription:
      "Identities fetched successfully with pagination metadata and associated account information.",
    tags: TAGS,
  })
  .input(IdentityListInputSchema)
  .output(IdentityListOutputSchema);

export const identityContract = {
  create: identityCreate,
  register: identityRegister,
  list: identityList,
  claims: claimsContract,
};
