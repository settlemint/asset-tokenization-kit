import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating set pincode mutation inputs
 *
 * @property {string} name - The name for the pincode verification
 * @property {string} address - The wallet address
 * @property {string} pincode - The pincode for wallet verification
 */
export function SetPincodeSchema() {
  return t.Object(
    {
      name: t.String({
        description: "The name for the pincode verification",
      }),
      address: t.EthereumAddress({
        description: "The wallet address",
      }),
      pincode: t.String({
        description: "The pincode for wallet verification",
      }),
    },
    {
      description: "Schema for validating set pincode mutation inputs",
    }
  );
}

export type SetPincodeInput = StaticDecode<ReturnType<typeof SetPincodeSchema>>;
