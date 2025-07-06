import { ethereumHash } from "@/lib/zod/validators/ethereum-hash";
import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FactoryCreateOutputSchema,
  FactoryCreateSchema,
} from "@/orpc/routes/token/routes/factory.create.schema";
import {
  FactoryListSchema,
  TokenFactoryListSchema,
} from "@/orpc/routes/token/routes/factory.list.schema";
import {
  FactoryReadSchema,
  TokenFactoryDetailSchema,
} from "@/orpc/routes/token/routes/factory.read.schema";
import {
  TokenListInputSchema,
  TokenListSchema,
} from "@/orpc/routes/token/routes/token.list.schema";
import { TokenMintSchema } from "@/orpc/routes/token/routes/token.mint.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { eventIterator } from "@orpc/server";
import { z } from "zod/v4";

const factoryCreate = baseContract
  .route({
    method: "POST",
    path: "/token/factory",
    description: "Create a new token factory",
    successDescription: "New token factory created",
    tags: ["token"],
  })
  .input(FactoryCreateSchema)
  .output(eventIterator(FactoryCreateOutputSchema));

const factoryList = baseContract
  .route({
    method: "GET",
    path: "/token/factory",
    description: "List all token factories",
    successDescription: "List of token factories",
    tags: ["token"],
  })
  .input(TokenFactoryListSchema)
  .output(FactoryListSchema);

const factoryRead = baseContract
  .route({
    method: "GET",
    path: "/token/factory/{id}",
    description: "Get a token factory by ID",
    successDescription: "Token factory details",
    tags: ["token"],
  })
  .input(FactoryReadSchema)
  .output(TokenFactoryDetailSchema);

const depositCreate = baseContract
  .route({
    method: "POST",
    path: "/token/deposit",
    description: "Create a new deposit token",
    successDescription: "Deposit token created",
    tags: ["token", "deposit"],
  })
  .input(TokenCreateSchema)
  .output(eventIterator(TokenCreateOutputSchema));

const bondCreate = baseContract
  .route({
    method: "POST",
    path: "/token/bond",
    description: "Create a new bond token",
    successDescription: "Bond token created",
    tags: ["token", "bond"],
  })
  .input(TokenCreateSchema)
  .output(eventIterator(TokenCreateOutputSchema));

const list = baseContract
  .route({
    method: "GET",
    path: "/token",
    description: "Get the list of tokens",
    successDescription: "List of tokens",
    tags: ["token"],
  })
  .input(TokenListInputSchema)
  .output(TokenListSchema);

const read = baseContract
  .route({
    method: "GET",
    path: "/token/{id}",
    description: "Get a token by id",
    successDescription: "Token",
    tags: ["token"],
  })
  .input(z.object({ id: z.string() }))
  .output(TokenSchema);

const mint = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/mint",
    description: "Mint tokens",
    successDescription: "Tokens minted",
    tags: ["token"],
  })
  .input(TokenMintSchema)
  .output(ethereumHash);

export const tokenContract = {
  factoryCreate,
  factoryList,
  factoryRead,
  depositCreate,
  bondCreate,
  list,
  read,
  mint,
};
