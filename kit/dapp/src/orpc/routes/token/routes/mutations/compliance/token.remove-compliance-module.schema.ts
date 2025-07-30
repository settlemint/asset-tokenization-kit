import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenRemoveComplianceModuleInputSchema =
  MutationInputSchemaWithContract.extend({
    moduleAddress: ethereumAddress.describe(
      "The address of the compliance module to remove"
    ),
  });

export type TokenRemoveComplianceModuleInput = z.infer<
  typeof TokenRemoveComplianceModuleInputSchema
>;
