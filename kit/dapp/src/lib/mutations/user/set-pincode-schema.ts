import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating set pincode mutation inputs
 *
 * @property {string} pincode - The pincode for wallet verification
 */
export function SetPincodeSchema() {
  return t.Object(
    {
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
