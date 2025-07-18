import { ATKContracts } from "../../../constants/contracts";
import type { ATKTopic } from "../../../constants/topics";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { topicManager } from "../../../services/topic-manager";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

/**
 * Removes a claim from a token's identity contract.
 *
 * @param asset The asset to remove the claim from.
 * @param claim The claim to remove.
 */
export const removeClaim = async (asset: Asset<any>, claimTopic: ATKTopic) => {
  console.log(`[Asset classification claim] → Starting claim issuance...`);

  const tokenIdentityContract = owner.getContractInstance({
    address: asset.identity,
    abi: ATKContracts.contractIdentity,
  });

  const claims = await tokenIdentityContract.read.getClaimIdsByTopic([
    topicManager.getTopicId(claimTopic),
  ]);
  const claim = claims[0];
  const transactionHash = await withDecodedRevertReason(() =>
    tokenIdentityContract.write.removeClaim([claim])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Asset classification claim] ✓ Claim removed for token identity ${asset.name} (${asset.identity})`
  );
};
