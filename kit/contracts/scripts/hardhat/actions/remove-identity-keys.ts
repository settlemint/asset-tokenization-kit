import { ATKContracts } from "../constants/contracts";

import type { Actor } from "../entities/actor";
import { waitForSuccess } from "../utils/wait-for-success";

export const removeIdentityKeys = async (actor: Actor, purpose: bigint) => {
  console.log(`[Remove identity key] → Starting removal of key ${purpose}...`);

  const identityAddress = await actor.getIdentity();

  // let the actor do it, else we cannot do it in parallel ... we get nonce issues then
  const identityContract = actor.getContractInstance({
    address: identityAddress,
    abi: ATKContracts.identity,
  });

  const keys = await identityContract.read.getKeysByPurpose([purpose]);

  for (const key of keys) {
    const transactionHash = await identityContract.write.removeKey([
      key,
      purpose,
    ]);
    await waitForSuccess(transactionHash);
  }

  console.log(
    `[Remove identity key] ✓ ${keys.length} keys removed for purpose ${purpose} for identity ${actor.name} (${actor.address})`
  );
};
