import type { Address } from "viem";
import { ATKContracts } from "../../../constants/contracts";
import type { Actor } from "../../../entities/actor";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const recoverTokens = async (
  asset: Asset<any>,
  actor: Actor,
  lostWallet: Address
) => {
  console.log(`[Recover tokens] → Starting token recovery...`);

  const tokenContract = actor.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.recoverTokens([lostWallet])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Recover tokens] ✓ ${actor.name} recovered ${asset.name} (${asset.address}) tokens from ${lostWallet}`
  );
};
