import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating equity creation inputs
 *
 * @property {string} assetName - The name of the equity
 * @property {string} symbol - The symbol of the equity (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} equityCategory - The category of the equity
 * @property {string} equityClass - The class of the equity
 * @property {string} predictedAddress - The predicted contract address
 * @property {number} valueInBaseCurrency - The value in base currency
 */
export function RegisterSchemaSchema() {
  return t.Object(
    {
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
    },
    {
      description: "Schema for registering an EAS schema",
    }
  );
}

export type RegisterSchemaInput = StaticDecode<
  ReturnType<typeof RegisterSchemaSchema>
>;
