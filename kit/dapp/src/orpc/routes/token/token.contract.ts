import { ethereumHash } from "@/lib/zod/validators/ethereum-hash";
import { baseContract } from "@/orpc/procedures/base.contract";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { BondTokenCreateSchema } from "@/orpc/routes/token/routes/bond/bond.create.schema";
import { TokenListSchema } from "@/orpc/routes/token/routes/token.list.schema";

const create = baseContract
  .route({
    method: "POST",
    path: "/tokens/bond",
    description: "Create a new bond token",
    successDescription: "Bond token created",
    tags: ["token", "bond"],
  })
  .input(BondTokenCreateSchema)
  .output(ethereumHash);

const list = baseContract
  .route({
    method: "GET",
    path: "/tokens",
    description: "Get the list of tokens",
    successDescription: "List of tokens",
    tags: ["token"],
  })
  .input(ListSchema)
  .output(TokenListSchema);

export const tokenContract = {
  create,
  list,
};
