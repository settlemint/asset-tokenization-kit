import { TokenType, type TokenTypeKey } from '@/types/token-types';
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
  tokenType: z.literal(TokenType.Stablecoin),
  collateralProofValidityDuration: z.number(),
  collateralThreshold: z.number(),
});

export type CreateStablecoinSchemaType = z.infer<typeof CreateStablecoinSchema>;

export const CreateEquitySchema = BaseTokenFields.extend({
  tokenType: z.literal(TokenType.Equity),
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
  tokenType: z.literal(TokenType.Bond),
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
  tokenType: z.literal(TokenType.Cryptocurrency),
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
  Stablecoin: {
    tokenType: TokenType.Stablecoin,
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    isin: '',
    private: false,
    pincode: '',
    collateralProofValidityDuration: 30 * 24 * 60 * 60,
    collateralThreshold: 100,
  },
  Equity: {
    tokenType: TokenType.Equity,
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    isin: '',
    private: false,
    pincode: '',
    equityClass: '',
    equityCategory: '',
  },
  Bond: {
    tokenType: TokenType.Bond,
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
  Cryptocurrency: {
    tokenType: TokenType.Cryptocurrency,
    tokenName: '',
    tokenSymbol: '',
    decimals: 18,
    isin: '',
    private: false,
    pincode: '',
  },
} as const satisfies Record<TokenTypeKey, CreateTokenSchemaType>;

export type CreateTokenFormStepFields = keyof (
  | typeof createTokenDefaultValues.Stablecoin
  | typeof createTokenDefaultValues.Equity
  | typeof createTokenDefaultValues.Bond
  | typeof createTokenDefaultValues.Cryptocurrency
);

export const createTokenFormStepFields: CreateTokenFormStepFields[] = [
  ...new Set([
    ...Object.keys(createTokenDefaultValues.Stablecoin),
    ...Object.keys(createTokenDefaultValues.Equity),
    ...Object.keys(createTokenDefaultValues.Bond),
    ...Object.keys(createTokenDefaultValues.Cryptocurrency),
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
    if (data.tokenType === TokenType.Stablecoin) {
      schema = CreateStablecoinSchema;
    } else if (data.tokenType === TokenType.Equity) {
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
