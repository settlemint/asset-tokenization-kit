import { ethereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { verificationCode } from "@/lib/utils/zod/validators/verification-code";
import { verificationType } from "@/lib/utils/zod/validators/verification-type";
import { z } from "zod";

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
