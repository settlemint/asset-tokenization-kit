import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenAddComplianceModuleInputSchema = MutationInputSchema.extend({
  moduleAddress: ethereumAddress.describe(
    "The address of the compliance module to add"
  ),
});

export type TokenAddComplianceModuleInput = z.infer<
  typeof TokenAddComplianceModuleInputSchema
>;
