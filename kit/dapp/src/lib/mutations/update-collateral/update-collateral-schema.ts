import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Schema for updating collateral
 * @property {string} address - The address of the asset
 * @property {string} assettype - The type of asset (only stablecoin or deposit)
 * @property {string} collateral - The collateral amount
 */
export const UpdateCollateralSchema = t.Object(
  {
    address: t.String({
      minLength: 42,
      maxLength: 42,
      error: "Invalid address",
    }),
    assettype: t.String({
      minLength: 1,
      maxLength: 50,
      description: "The type of asset (only stablecoin or deposit)",
      error: "Invalid asset type",
    }),
    collateral: t.String({
      minLength: 1,
      error: "Invalid collateral amount",
    }),
  },
  { $id: "UpdateCollateral" }
);

export type UpdateCollateralInput = StaticDecode<
  ReturnType<typeof UpdateCollateralSchema>
>;
