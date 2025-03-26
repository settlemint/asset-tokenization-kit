import { isAddressAvailable } from "@/lib/queries/bond-factory/bond-factory-address-available";
import { type StaticDecode, t } from "@/lib/utils/typebox";
import { isFuture } from "date-fns";

/**
 * TypeBox schema for validating bond creation inputs
 *
 * @property {string} assetName - The name of the bond
 * @property {string} symbol - The symbol of the bond (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} cap - Maximum issuance amount
 * @property {string} faceValue - Face value of the bond
 * @property {string} maturityDate - Maturity date of the bond
 * @property {string} underlyingAsset - Underlying asset of the bond
 */
export function CreateBondSchema({
  maxCap,
  minCap,
  maxFaceValue,
  minFaceValue,
  decimals,
}: {
  maxCap?: number;
  minCap?: number;
  maxFaceValue?: number;
  minFaceValue?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      assetName: t.String({
        description: "The name of the bond",
        minLength: 1,
      }),
      symbol: t.AssetSymbol({
        description: "The symbol of the bond (ticker)",
      }),
      decimals: t.Decimals({
        description: "The number of decimal places for the token",
      }),
      isin: t.Optional(
        t.Isin({
          description: "International Securities Identification Number",
        })
      ),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      cap: t.Amount(maxCap, minCap, decimals, {
        description: "Maximum issuance amount",
        errorMessage: "Must be at least 1",
      }),
      faceValue: t.Amount(maxFaceValue, minFaceValue, decimals, {
        description: "Face value of the bond",
        errorMessage: "Must be at least 1",
      }),
      maturityDate: t.String({
        description: "Maturity date of the bond",
        format: "date-time",
        refinement: {
          predicate: (value: string) => isFuture(new Date(value)),
          message: "Maturity date must be in the future",
        },
      }),
      underlyingAsset: t.Any({
        description: "Underlying asset of the bond",
      }),
      predictedAddress: t.EthereumAddress({
        description: "Predicted address of the bond",
        refinement: {
          predicate: isAddressAvailable,
          message: "bond.duplicate",
        },
      }),
      price: t.Price({
        description: "Price of the bond",
      }),
    },
    {
      description: "Schema for validating bond creation inputs",
    }
  );
}

export type CreateBondInput = StaticDecode<ReturnType<typeof CreateBondSchema>>;
