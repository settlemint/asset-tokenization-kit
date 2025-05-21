import {
  ReserveComplianceStatus,
  TokenType,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { t } from "@/lib/utils/typebox";

const AssetPercentagesSchema = t.Object({
  bankDeposits: t.Number({ minimum: 0, maximum: 100 }),
  governmentBonds: t.Number({ minimum: 0, maximum: 100 }),
  liquidAssets: t.Number({ minimum: 0, maximum: 100 }),
  corporateBonds: t.Number({ minimum: 0, maximum: 10 }),
  centralBankAssets: t.Number({ minimum: 0, maximum: 100 }),
  commodities: t.Number({ minimum: 0, maximum: 100 }),
  otherAssets: t.Number({ minimum: 0, maximum: 100 }),
});

export const BaseSchema = t.Object(
  {
    tokenType: t.Union([
      t.Literal(TokenType.ELECTRONIC_MONEY_TOKEN),
      t.Literal(TokenType.ASSET_REFERENCED_TOKEN),
    ]),
    address: t.EthereumAddress(),
    ...AssetPercentagesSchema.properties,
    lastAuditDate: t.String(),
    reserveStatus: t.Union([
      t.Literal(ReserveComplianceStatus.COMPLIANT),
      t.Literal(ReserveComplianceStatus.PENDING_REVIEW),
      t.Literal(ReserveComplianceStatus.UNDER_INVESTIGATION),
      t.Literal(ReserveComplianceStatus.NON_COMPLIANT),
    ]),
    verificationCode: t.VerificationCode({
      description:
        "The verification code (PIN, 2FA, or secret code) for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
  },
  { $id: "UpdateReserves" }
);

// Schema for form validation
export const UpdateReservesSchema = () => BaseSchema;
