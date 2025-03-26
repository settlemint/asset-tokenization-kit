import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating update kyc status mutation inputs
 *
 * @property {string} kycVerified - The timestamp of the KYC verification
 */
export function UpdateKycStatusSchema() {
  return t.Object(
    {
      userId: t.String({
        description: "The unique identifier of the user",
      }),
      kycVerified: t.Timestamp({
        description: "The timestamp of the KYC verification",
      }),
    },
    {
      description: "Schema for validating update kyc status mutation inputs",
    }
  );
}

export type UpdateKycStatusInput = StaticDecode<
  ReturnType<typeof UpdateKycStatusSchema>
>;
