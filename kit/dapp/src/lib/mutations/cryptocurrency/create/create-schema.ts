import { isAddressAvailable } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-address-available";
import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} [initialSupply] - Initial supply of tokens (defaults to '0')
 * @property {Address} predictedAddress - Predicted address of the cryptocurrency
 */
export function CreateCryptoCurrencySchema({
  maxInitialSupply,
  decimals,
}: {
  maxInitialSupply?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the cryptocurrency",
        minLength: 1,
      }),
      symbol: t.AssetSymbol({
        description: "The symbol of the cryptocurrency (ticker)",
      }),
      decimals: t.Decimals({
        description: "The number of decimal places for the token",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      initialSupply: t.Amount(maxInitialSupply, 0, decimals, {
        description: "Initial supply of tokens",
        default: 0,
      }),
      predictedAddress: t.EthereumAddress({
        description: "Predicted address of the cryptocurrency",
        refinement: {
          predicate: isAddressAvailable,
          message: "cryptocurrency.duplicate",
        },
      }),
      valueInBaseCurrency: t.Amount(Number.MAX_SAFE_INTEGER, 0, 6, {
        description: "Value in base currency",
      }),
    },
    {
      description: "Schema for validating cryptocurrency creation inputs",
    }
  );
}

export type CreateCryptoCurrencyInput = StaticDecode<
  ReturnType<typeof CreateCryptoCurrencySchema>
>;
