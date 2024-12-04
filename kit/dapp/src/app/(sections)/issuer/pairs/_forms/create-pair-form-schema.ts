import { z } from "zod";

export const CreateDexPairSchema = z.object({
  baseTokenAddress: z.string(),
  quoteTokenAddress: z.string(),
});

export type CreateDexPairSchemaType = z.infer<typeof CreateDexPairSchema>;

export const createDexPairDefaultValues: CreateDexPairSchemaType = {
  baseTokenAddress: "",
  quoteTokenAddress: "",
} as const;

export type CreateDexPairFormPageFields = keyof typeof createDexPairDefaultValues;

export const createDexPairFormPageFields: CreateDexPairFormPageFields[] = Object.keys(
  createDexPairDefaultValues,
) as CreateDexPairFormPageFields[];
