import { z } from 'zod';

export const CreateTokenSchema = z.object({
  tokenName: z.string().min(1, { message: 'Token name is required' }),
  tokenSymbol: z.string().min(1, { message: 'Token symbol is required' }),
  decimals: z.number(),
  isin: z.string().optional(),
  collateralProofValidityDuration: z.number(),
  collateralThreshold: z.number(),
});

export type CreateTokenSchemaType = z.infer<typeof CreateTokenSchema>;

export const createTokenDefaultValues: CreateTokenSchemaType = {
  tokenName: '',
  tokenSymbol: '',
  decimals: 18,
  isin: '',
  collateralProofValidityDuration: 3600,
  collateralThreshold: 100,
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
