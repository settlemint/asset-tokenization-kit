import type { StaticDecode } from "@/lib/utils/typebox";
import { t } from "elysia";

export function EnableTwoFactorSchema() {
  return t.Object(
    {
      algorithm: t.UnionEnum(
        [
          "SHA1",
          "SHA3_224",
          "SHA3_256",
          "SHA3_384",
          "SHA3_512",
          "SHA224",
          "SHA256",
          "SHA384",
          "SHA512",
        ],
        {
          description: "The algorithm to use for the OTP",
        }
      ),
      digits: t.Number({
        description: "The number of digits in the OTP",
      }),
      period: t.Number({
        description: "The period of the OTP",
      }),
    },
    {
      description: "Schema for verifying 2FA OTP",
    }
  );
}

export type EnableTwoFactorInput = StaticDecode<
  ReturnType<typeof EnableTwoFactorSchema>
>;
