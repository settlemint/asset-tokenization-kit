import { Address } from "viem";
import { SMARTContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const forcedRecoverTokens = async (
  asset: Asset<any>,
  custodian: AbstractActor,
  newWallet: AbstractActor,
  lostWallet: Address
) => {
  const custodianContract = custodian.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartCustodian,
  });

  const transactionHash = await custodianContract.write.forcedRecoverTokens([
    lostWallet,
    newWallet.address,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Forced recover tokens] ${custodian.name} (${custodian.address}) recovered ${asset.name} (${asset.address}) tokens from ${lostWallet}`
  );
};
