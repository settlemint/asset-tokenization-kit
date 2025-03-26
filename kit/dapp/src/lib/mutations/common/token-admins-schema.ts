import { t } from "@/lib/utils/typebox";

export const TokenAdminsSchemaFragment = () => t.Object({
  tokenAdmins: t.Array(
    t.Object({
      wallet: t.String({
        minLength: 1,
        error: "Wallet address is required",
        format: "ethereum-address"
      }),
      roles: t.Array(
        t.Union([
          t.Literal("admin"),
          t.Literal("user-manager"),
          t.Literal("issuer")
        ]),
        { minItems: 1, error: "At least one role is required" }
      )
    }),
    { minItems: 1, error: "At least one admin is required" }
  )
});