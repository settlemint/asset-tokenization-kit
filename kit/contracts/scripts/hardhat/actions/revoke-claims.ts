import { ATKContracts } from "../constants/contracts";

import { ATKTopic } from "../constants/topics";
import type { Actor } from "../entities/actor";
import { topicManager } from "../services/topic-manager";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { waitForSuccess } from "../utils/wait-for-success";

export const revokeClaims = async (actor: Actor, claimTopic: ATKTopic) => {
  console.log(
    `[Revoke claims] → Starting claims revocation for topic ${claimTopic}...`
  );

  const identityAddress = await actor.getIdentity();

  // let the actor do it, else we cannot do it in parallel ... we get nonce issues then
  const identityContract = actor.getContractInstance({
    address: identityAddress,
    abi: ATKContracts.identity,
  });

  const claims = await identityContract.read.getClaimIdsByTopic([
    topicManager.getTopicId(claimTopic),
  ]);

  for (const claim of claims) {
    const transactionHash = await withDecodedRevertReason(() =>
      identityContract.write.revokeClaim([claim, identityAddress])
    );

    await waitForSuccess(transactionHash);
  }

  console.log(
    `[Revoke claims] ✓ ${claims.length} claims revoked for topic ${claimTopic} for identity ${actor.name} (${actor.address})`
  );
};
