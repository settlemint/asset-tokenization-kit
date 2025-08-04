import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { EthereumHash } from "@/lib/zod/validators/ethereum-hash";
import type { ChallengeResponse } from "@/orpc/helpers/challenge-response";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";

export interface TokenCreateContext {
  mutationVariables: {
    address: EthereumAddress;
    from: EthereumAddress;
  } & ChallengeResponse;
  portalClient: ValidatedPortalClient;
}

export async function createToken(
  _input: TokenCreateInput,
  _context: TokenCreateContext,
  mutateFn: () => Promise<EthereumHash>
): Promise<EthereumHash> {
  // Execute transaction and return the hash
  const transactionHash = await mutateFn();

  return transactionHash;
}
