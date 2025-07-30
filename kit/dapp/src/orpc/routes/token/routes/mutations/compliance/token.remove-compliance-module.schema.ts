import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenRemoveComplianceModuleInputSchema =
  MutationInputSchema.extend({
    moduleAddress: ethereumAddress.describe(
      "The address of the compliance module to remove"
    ),
  });

export type TokenRemoveComplianceModuleInput = z.infer<
  typeof TokenRemoveComplianceModuleInputSchema
>;
