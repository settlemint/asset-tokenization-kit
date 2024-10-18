import { z } from "zod";

export const MintWizardValidator = z.object({
  amount: z.number(),
  toAddress: z
    .string()
    .min(2)
    .regex(/^0x[a-f0-9]{40}$/i, {
      message: "Invalid Ethereum address. It should start with '0x' followed by 40 hexadecimal characters.",
    }),
});

export type MintWizardSchema = z.infer<typeof MintWizardValidator>;

export const mintWizardDefaultValues: MintWizardSchema = {
  amount: 1,
  toAddress: "",
} as const;

export type MintWizardFormPageFields = keyof typeof mintWizardDefaultValues;

export const CreateTokenFormPageFields: MintWizardFormPageFields[] = Object.keys(
  mintWizardDefaultValues,
) as MintWizardFormPageFields[];
