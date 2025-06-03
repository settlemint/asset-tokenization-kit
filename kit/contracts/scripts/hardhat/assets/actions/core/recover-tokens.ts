import { Address } from "viem";
import { SMARTContracts } from "../../../constants/contracts";
import { AbstractActor } from "../../../entities/actors/abstract-actor";
import type { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const recoverTokens = async (
  asset: Asset<any>,
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
