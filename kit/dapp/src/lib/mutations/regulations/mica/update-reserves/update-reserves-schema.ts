import {
  ReserveComplianceStatus,
  TokenType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { t } from "@/lib/utils/typebox";

export const UpdateReservesSchema = () =>
  t.Object(
    {
      tokenType: t.Union([
        t.Literal(TokenType.ELECTRONIC_MONEY_TOKEN),
        t.Literal(TokenType.ASSET_REFERENCED_TOKEN),
      ]),
      address: t.String({ format: "address" }),
      bankDeposits: t.Number({ minimum: 0, maximum: 100 }),
      governmentBonds: t.Number({ minimum: 0, maximum: 100 }),
      liquidAssets: t.Number({ minimum: 0, maximum: 100 }),
      corporateBonds: t.Number({ minimum: 0, maximum: 10 }),
      centralBankAssets: t.Number({ minimum: 0, maximum: 100 }),
      commodities: t.Number({ minimum: 0, maximum: 100 }),
      otherAssets: t.Number({ minimum: 0, maximum: 100 }),
      lastAuditDate: t.String({ format: "date-time" }),
      reserveStatus: t.Union([
        t.Literal(ReserveComplianceStatus.COMPLIANT),
        t.Literal(ReserveComplianceStatus.PENDING_REVIEW),
        t.Literal(ReserveComplianceStatus.UNDER_INVESTIGATION),
        t.Literal(ReserveComplianceStatus.NON_COMPLIANT),
      ]),
    },
    { $id: "UpdateReserves" }
  );
