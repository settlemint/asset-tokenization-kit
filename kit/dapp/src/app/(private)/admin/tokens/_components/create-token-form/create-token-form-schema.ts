import { z } from 'zod';

export const CreateTokenSchema = z.object({
  tokenName: z.string().min(1, { message: 'Token name is required' }),
  tokenSymbol: z.string().min(1, { message: 'Token symbol is required' }),
  decimals: z.number(),
  isin: z.string().optional(),
  admin: z.string(),
  collateralProofValidity: z.number(),
  tokenPermissions: z
    .array(
      z.object({
        id: z.string(),
        wallet: z.string(),
        email: z.string(),
        name: z.string(),
        tokenPermissions: z.array(z.string()),
      })
    )
    .min(1, { message: 'at least one admin with token permissions is required' }),
  uploadRecipients: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('text/'), {
      message: 'Must be a CSV file',
    })
    .optional(),
  tokenDistribution: z
    .array(
      z.object({
        id: z.string(),
        wallet: z.string(),
        email: z.string(),
        name: z.string(),
        amount: z.number(),
      })
    )
    .optional(),
  searchRecipientText: z.string().optional(),
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
  uploadRecipients: undefined,
} as const;

export type CreateTokenFormStepFields = keyof typeof createTokenDefaultValues;

export const createTokenFormStepFields: CreateTokenFormStepFields[] = Object.keys(
  createTokenDefaultValues
) as CreateTokenFormStepFields[];

export function validateCreateTokenSchemaFields(
  fields: (keyof CreateTokenSchemaType)[],
  data: Partial<CreateTokenSchemaType>
) {
  try {
    CreateTokenSchema.pick(getMask(fields)).parse(data);
    return true;
  } catch {
    return false;
  }
}

function getMask<Schema extends z.AnyZodObject, Fields extends keyof z.TypeOf<Schema>>(arr: Fields[]) {
  return arr.reduce(
    (acc, item) => {
      acc[item] = true;
      return acc;
    },
    {} as { [k in Fields]?: true }
  );
}
