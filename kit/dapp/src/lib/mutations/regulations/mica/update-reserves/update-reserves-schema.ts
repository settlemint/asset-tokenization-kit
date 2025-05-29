import {
  ReserveComplianceStatus,
  TokenType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { type StaticDecode, t } from "@/lib/utils/typebox";

const AssetPercentagesSchema = t.Object({
  bankDeposits: t.Number({ minimum: 0, maximum: 100 }),
  governmentBonds: t.Number({ minimum: 0, maximum: 100 }),
  liquidAssets: t.Number({ minimum: 0, maximum: 100 }),
  corporateBonds: t.Number({ minimum: 0, maximum: 10 }),
  centralBankAssets: t.Number({ minimum: 0, maximum: 100 }),
  commodities: t.Number({ minimum: 0, maximum: 100 }),
  otherAssets: t.Number({ minimum: 0, maximum: 100 }),
});

export function UpdateReservesSchema() {
  const today = new Date().toISOString().split("T")[0];

  return t.Object(
    {
      address: t.EthereumAddress(),
      tokenType: t.Union([
        t.Literal(TokenType.ELECTRONIC_MONEY_TOKEN),
        t.Literal(TokenType.ASSET_REFERENCED_TOKEN),
      ]),
      ...AssetPercentagesSchema.properties,
      lastAuditDate: t.Optional(
        t.Union([
          t.String({
            format: "date",
            maximum: today,
            error: "Last audit date cannot be in the future",
          }),
          t.Null(),
        ])
      ),
      reserveStatus: t.Union([
        t.Literal(ReserveComplianceStatus.COMPLIANT),
        t.Literal(ReserveComplianceStatus.PENDING_REVIEW),
        t.Literal(ReserveComplianceStatus.UNDER_INVESTIGATION),
        t.Literal(ReserveComplianceStatus.NON_COMPLIANT),
      ]),
    },
    { $id: "UpdateReserves" }
  );
}

export type UpdateReservesInput = StaticDecode<
  ReturnType<typeof UpdateReservesSchema>
>;
