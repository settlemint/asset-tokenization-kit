import { baseContract } from "@/orpc/procedures/base.contract";
import claimsContract from "@/orpc/routes/system/identity/claims/claims.contract";
import { IdentityCreateSchema } from "@/orpc/routes/system/identity/routes/identity.create.schema";
import {
  IdentityListInputSchema,
  IdentityListOutputSchema,
} from "@/orpc/routes/system/identity/routes/identity.list.schema";
import { IdentitySchema } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import { IdentityRegisterSchema } from "@/orpc/routes/system/identity/routes/identity.register.schema";
import {
  IdentitySearchResultSchema,
  IdentitySearchSchema,
} from "@/orpc/routes/system/identity/routes/identity.search.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

const TAGS = ["identity"];

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
  .output(IdentitySchema);

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
  .output(IdentitySchema);

const identityReadByWallet = baseContract
  .route({
    method: "GET",
    path: "/system/identity/by-wallet/{wallet}",
    description: "Read identity information by wallet address",
    successDescription: "Identity information retrieved successfully",
    tags: TAGS,
  })
  .input(
    z.object({
      wallet: ethereumAddress.describe(
        "The wallet address of the user to read the identity for"
      ),
    })
  )
  .output(IdentitySchema);

const identityReadById = baseContract
  .route({
    method: "GET",
    path: "/system/identity/by-id/{identityId}",
    description: "Read identity information by identity contract ID",
    successDescription: "Identity information retrieved successfully",
    tags: TAGS,
  })
  .input(
    z.object({
      identityId: ethereumAddress.describe(
        "The ID of the identity contract to read"
      ),
    })
  )
  .output(IdentitySchema);

const identitySearch = baseContract
  .route({
    method: "POST",
    path: "/system/identity/search",
    description:
      "Search for basic identity information without claims by account address or identity contract address",
    successDescription: "Identity search completed successfully",
    tags: TAGS,
  })
  .input(IdentitySearchSchema)
  .output(IdentitySearchResultSchema);

const identityMe = baseContract
  .route({
    method: "GET",
    path: "/system/identity/me",
    description:
      "Get the authenticated user's identity information from the current system",
    successDescription:
      "Current user's identity information retrieved successfully",
    tags: TAGS,
  })
  .output(IdentitySchema);

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
  readByWallet: identityReadByWallet,
  readById: identityReadById,
  search: identitySearch,
  me: identityMe,
  list: identityList,
  claims: claimsContract,
};
