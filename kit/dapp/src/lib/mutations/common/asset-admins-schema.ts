import { t } from "@/lib/utils/typebox";

export const AssetAdminsSchemaFragment = () => t.Array(
  t.Object({
    wallet: t.EthereumAddress({
      error: "Wallet address is required"
    }),
    roles: t.Array(
      t.Union([
        t.Literal("admin"),
        t.Literal("user-manager"),
        t.Literal("issuer")
      ]),
      { minItems: 1, error: "At least one role is required" }
    )
  })
);