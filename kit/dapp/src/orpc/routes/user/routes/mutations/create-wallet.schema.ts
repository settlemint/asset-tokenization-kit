import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { MutationOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";

export const CreateWalletOutputSchema = MutationOutputSchema.extend({
  result: ethereumAddress,
});
