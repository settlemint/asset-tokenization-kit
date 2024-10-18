import { z } from "zod";

export const CreateTokenSchema = z.object({
  tokenName: z.string().min(2),
  tokenSymbol: z.string().min(2),
});

export type CreateTokenSchemaType = z.infer<typeof CreateTokenSchema>;

export const createTokenDefaultValues: CreateTokenSchemaType = {
  tokenName: "",
  tokenSymbol: "",
} as const;

export type CreateTokenFormPageFields = keyof typeof createTokenDefaultValues;

export const createTokenFormPageFields: CreateTokenFormPageFields[] = Object.keys(
  createTokenDefaultValues,
) as CreateTokenFormPageFields[];
