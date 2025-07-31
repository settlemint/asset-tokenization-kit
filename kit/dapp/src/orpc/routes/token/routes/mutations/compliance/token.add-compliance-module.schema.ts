import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import type { z } from "zod";

export const TokenAddComplianceModuleInputSchema =
  MutationInputSchemaWithContract.extend({
    moduleAddress: ethereumAddress.describe(
      "The address of the compliance module to add"
    ),
  });

export type TokenAddComplianceModuleInput = z.infer<
  typeof TokenAddComplianceModuleInputSchema
>;
