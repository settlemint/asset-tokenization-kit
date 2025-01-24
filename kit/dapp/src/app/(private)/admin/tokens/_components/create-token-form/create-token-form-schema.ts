import { z } from 'zod';

export const BaseTokenFields = z.object({
  tokenName: z.string().min(1, { message: 'Token name is required' }),
  tokenSymbol: z.string().min(1, { message: 'Token symbol is required' }),
  decimals: z.number(),
  isin: z.string().optional(),
  private: z.boolean().optional(),
  pincode: z.string().length(6).regex(/^\d+$/, 'PIN code must contain only numbers'),
});
export type BaseTokenFieldsType = z.infer<typeof BaseTokenFields>;

export const CreateStablecoinSchema = BaseTokenFields.extend({
  tokenType: z.literal('stablecoin'),
  collateralProofValidityDuration: z.number(),
  collateralThreshold: z.number(),
});

export type CreateStablecoinSchemaType = z.infer<typeof CreateStablecoinSchema>;

export const CreateEquitySchema = BaseTokenFields.extend({
  tokenType: z.literal('equity'),
  equityClass: z.string().min(1, { message: 'Equity class is required' }),
  equityCategory: z.string().min(1, { message: 'Equity category is required' }),
});
export type CreateEquitySchemaType = z.infer<typeof CreateEquitySchema>;

export const PaymentFrequency = {
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  SemiAnnually: 'Semi-annually',
  Annually: 'Annually',
} as const;

export const CreateBondSchema = BaseTokenFields.extend({
  tokenType: z.literal('bond'),
  faceValueCurrency: z.string(),
  faceValue: z.number(),
  maturityDate: z.date(),
  couponRate: z.number(),
  paymentFrequency: z.enum([
    PaymentFrequency.Monthly,
    PaymentFrequency.Quarterly,
    PaymentFrequency.SemiAnnually,
    PaymentFrequency.Annually,
  ]),
  firstCouponDate: z.date(),
});
export type CreateBondSchemaType = z.infer<typeof CreateBondSchema>;

export const CreateCryptocurrencySchema = BaseTokenFields.extend({
  tokenType: z.literal('cryptocurrency'),
});
export type CreateCryptocurrencySchemaType = z.infer<typeof CreateCryptocurrencySchema>;

export const CreateTokenSchema = z.discriminatedUnion('tokenType', [
  CreateStablecoinSchema,
  CreateEquitySchema,
  CreateBondSchema,
  CreateCryptocurrencySchema,
]);

export type CreateTokenSchemaType = z.infer<typeof CreateTokenSchema>;

export const createTokenDefaultValues = {
  stablecoin: {
    tokenType: 'stablecoin',
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    isin: '',
    private: false,
    pincode: '',
    collateralProofValidityDuration: 30 * 24 * 60 * 60,
    collateralThreshold: 100,
  },
  equity: {
    tokenType: 'equity',
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    isin: '',
    private: false,
    pincode: '',
    equityClass: '',
    equityCategory: '',
  },
  bond: {
    tokenType: 'bond',
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    isin: '',
    private: false,
    pincode: '',
    faceValueCurrency: '',
    faceValue: 0,
    maturityDate: new Date(),
    paymentFrequency: PaymentFrequency.Annually,
    couponRate: 0,
    firstCouponDate: new Date(),
  },
  cryptocurrency: {
    tokenType: 'cryptocurrency',
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    isin: '',
    private: false,
    pincode: '',
  },
} as const satisfies Record<string, CreateTokenSchemaType>;

export type CreateTokenFormStepFields = keyof (
  | typeof createTokenDefaultValues.stablecoin
  | typeof createTokenDefaultValues.equity
  | typeof createTokenDefaultValues.bond
  | typeof createTokenDefaultValues.cryptocurrency
);

export const createTokenFormStepFields: CreateTokenFormStepFields[] = [
  ...new Set([
    ...Object.keys(createTokenDefaultValues.stablecoin),
    ...Object.keys(createTokenDefaultValues.equity),
    ...Object.keys(createTokenDefaultValues.bond),
    ...Object.keys(createTokenDefaultValues.cryptocurrency),
  ]),
] as CreateTokenFormStepFields[];

export function validateCreateTokenSchemaFields(
  fields: (keyof CreateTokenSchemaType)[],
  data: Partial<CreateTokenSchemaType>
) {
  try {
    if (!data.tokenType) {
      return false;
    }

    let schema:
      | typeof CreateStablecoinSchema
      | typeof CreateEquitySchema
      | typeof CreateBondSchema
      | typeof CreateCryptocurrencySchema;
    if (data.tokenType === 'stablecoin') {
      schema = CreateStablecoinSchema;
    } else if (data.tokenType === 'equity') {
      schema = CreateEquitySchema;
    } else {
      schema = CreateBondSchema;
    }

    return z.object(Object.fromEntries(fields.map((f) => [f, schema.shape[f]]))).safeParse(data).success;
  } catch {
    return false;
  }
}

function getMask<Schema extends z.AnyZodObject, Fields extends keyof z.TypeOf<Schema>>(arr: Fields[]) {
  const result: { [k in Fields]?: true } = {};
  for (const item of arr) {
    result[item] = true;
  }
  return result;
}
