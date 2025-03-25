import { isAddressAvailable } from "@/lib/queries/equity-factory/equity-factory-address-available";
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
export function CreateEquitySchema() {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the equity",
        minLength: 1,
      }),
      symbol: t.AssetSymbol({
        description: "The symbol of the equity (ticker)",
      }),
      decimals: t.Decimals({
        description: "The number of decimal places for the token",
      }),
      isin: t.Optional(
        t.Isin({
          description:
            "Optional International Securities Identification Number",
        })
      ),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      equityCategory: t.String({
        description: "The category of the equity",
        minLength: 1,
      }),
      equityClass: t.String({
        description: "The class of the equity",
        minLength: 1,
      }),
      predictedAddress: t.EthereumAddress({
        description: "The predicted contract address",
        refine: isAddressAvailable,
        error: "equity.duplicate",
      }),
      price: t.Price({
        description: "Price of the cryptocurrency",
      }),
    },
    {
      description: "Schema for validating equity creation inputs",
    }
  );
}

export type CreateEquityInput = StaticDecode<
  ReturnType<typeof CreateEquitySchema>
>;
