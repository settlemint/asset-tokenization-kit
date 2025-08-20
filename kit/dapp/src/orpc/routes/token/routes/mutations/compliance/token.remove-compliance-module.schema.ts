import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
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
