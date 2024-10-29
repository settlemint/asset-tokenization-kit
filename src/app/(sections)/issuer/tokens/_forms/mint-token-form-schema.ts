import { z } from "zod";

export const MintTokenSchema = z.object({
  to: z.string(),
  amount: z.string(),
});

export type MintTokenSchemaType = z.infer<typeof MintTokenSchema>;

export const mintTokenDefaultValues: MintTokenSchemaType = {
  to: "",
  amount: "",
} as const;

export type MintTokenFormPageFields = keyof typeof mintTokenDefaultValues;

export const mintTokenFormPageFields: MintTokenFormPageFields[] = Object.keys(
  mintTokenDefaultValues,
) as MintTokenFormPageFields[];
