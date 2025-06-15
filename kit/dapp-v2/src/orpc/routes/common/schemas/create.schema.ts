import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { verificationCode } from "@/lib/zod/validators/verification-code";
import { verificationType } from "@/lib/zod/validators/verification-type";
import { z } from "zod/v4";

export const CreateSchema = z.object({
  contract: ethereumAddress
    .optional()
    .describe("The address of the contract to call this function on"),
  verification: z
    .object({
      code: verificationCode,
      type: verificationType.default("pincode"),
    })
    .describe(
      "The two factor authentication to authorize signing of the transaction"
    ),
});
