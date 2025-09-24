import { baseContract } from "@/orpc/procedures/base.contract";
import { TokenReadInputSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { z } from "zod";

/**
 * Schema for denomination asset bond data
 */
const DenominationAssetBondSchema = z.object({
  id: z.string(),
  token: z.object({
    id: z.string(),
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    totalSupply: z.string(),
    pausable: z.object({
      paused: z.boolean(),
    }),
    factory: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
  faceValue: z.string(),
  maturityDate: z.string(),
  isMatured: z.boolean(),
  denominationAssetNeeded: z.string(),
});

/**
 * Contract for token denomination assets endpoint
 */
export const tokenDenominationAssetsContract = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/denomination-assets",
    description:
      "Retrieves all bonds that use the specified token as their denomination asset",
    successDescription:
      "List of bonds that use the specified token as denomination asset",
    tags: ["token"],
  })
  .input(TokenReadInputSchema)
  .output(z.array(DenominationAssetBondSchema));
