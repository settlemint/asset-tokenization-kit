import { Address } from "viem";
import { AbstractActor } from "../../actors/abstract-actor";
import { SMARTContracts } from "../../constants/contracts";
import type { Asset } from "../../types/asset";
import { waitForSuccess } from "../../utils/wait-for-success";

export const recoverTokens = async (
  asset: Asset,
  actor: AbstractActor,
  lostWallet: Address
) => {
  const tokenContract = actor.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const transactionHash = await tokenContract.write.recoverTokens([lostWallet]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Recover tokens] ${actor.name} recovered ${asset.name} (${asset.address}) tokens from ${lostWallet}`
  );
};
