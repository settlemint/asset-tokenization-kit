import type { SessionUser } from "@atk/auth/server";
import type { EthereumAddress } from "@atk/zod/validators/ethereum-address";
import type { EthereumHash } from "@atk/zod/validators/ethereum-hash";
import type { ValidatedPortalClient } from "@/middlewares/services/portal.middleware";
import type { TokenCreateInput } from "@/routes/token/routes/mutations/create/token.create.schema";

export interface TokenCreateContext {
  mutationVariables: {
    address: EthereumAddress;
    from: EthereumAddress;
  };
  portalClient: ValidatedPortalClient;
  walletVerification: {
    sender: SessionUser;
    code: string;
    type: "OTP" | "PINCODE" | "SECRET_CODES";
  };
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
