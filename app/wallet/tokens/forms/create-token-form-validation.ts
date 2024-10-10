import { z } from "zod";

export const TokenizationWizardValidator = z.object({
  tokenName: z.string().min(2),
  tokenSymbol: z.string().min(2),
});

export type TokenizationWizardSchema = z.infer<typeof TokenizationWizardValidator>;

export const tokenizationWizardDefaultValues: TokenizationWizardSchema = {
  tokenName: "",
  tokenSymbol: "",
} as const;

export type TokenizationWizardFormPageFields = keyof typeof tokenizationWizardDefaultValues;

export const tokenizationWizardFormPageFields: TokenizationWizardFormPageFields[] = Object.keys(
  tokenizationWizardDefaultValues,
) as TokenizationWizardFormPageFields[];
