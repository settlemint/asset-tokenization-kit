import { ethereumHash } from "@/lib/zod/validators/ethereum-hash";
import { baseContract } from "@/orpc/procedures/base.contract";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { BondTokenCreateSchema } from "@/orpc/routes/token/routes/bond/bond.create.schema";
import {
  FactoryCreateOutputSchema,
  FactoryCreateSchema,
} from "@/orpc/routes/token/routes/factory.create.schema";
import { TokenListSchema } from "@/orpc/routes/token/routes/token.list.schema";
import { TokenMintSchema } from "@/orpc/routes/token/routes/token.mint.schema";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { eventIterator } from "@orpc/server";
import z from "zod/v4";

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

const bondCreate = baseContract
  .route({
    method: "POST",
    path: "/token/bond",
    description: "Create a new bond token",
    successDescription: "Bond token created",
    tags: ["token", "bond"],
  })
  .input(BondTokenCreateSchema)
  .output(ethereumHash);

const list = baseContract
  .route({
    method: "GET",
    path: "/token",
    description: "Get the list of tokens",
    successDescription: "List of tokens",
    tags: ["token"],
  })
  .input(ListSchema)
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
  bondCreate,
  list,
  read,
  mint,
};
