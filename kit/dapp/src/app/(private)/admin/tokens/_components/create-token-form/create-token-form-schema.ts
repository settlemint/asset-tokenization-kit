import { z } from 'zod';

export const CreateTokenSchema = z.object({
  tokenName: z.string().min(1, { message: 'Token name is required' }),
  tokenSymbol: z.string().min(1, { message: 'Token symbol is required' }),
  decimals: z.number(),
  isin: z.string(),
  admin: z.string(),
  collateralProofValidity: z.number(),
  tokenPermissions: z
    .array(
      z.object({
        userId: z.string(),
        userWallet: z.string(),
        userEmail: z.string(),
        userName: z.string(),
        tokenPermissions: z.array(z.string()),
      })
    )
    .length(1, { message: 'at least one admin with token permissions is required' }),
  tokenDistribution: z.array(
    z.object({
      userId: z.string(),
      userWallet: z.string(),
      userEmail: z.string(),
      userName: z.string(),
      tokenPermissions: z.array(z.string()),
    })
  ),
  tokenLogo: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), {
      message: 'Must be an image file',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    .optional(),
});

export type CreateTokenSchemaType = z.infer<typeof CreateTokenSchema>;

export const createTokenDefaultValues: CreateTokenSchemaType = {
  tokenName: '',
  tokenSymbol: '',
  decimals: 18,
  isin: '',
  collateralProofValidity: 3600,
  admin: '',
  tokenPermissions: [],
  tokenDistribution: [],
} as const;

export type CreateTokenFormStepFields = keyof typeof createTokenDefaultValues;

export const createTokenFormStepFields: CreateTokenFormStepFields[] = Object.keys(
  createTokenDefaultValues
) as CreateTokenFormStepFields[];
