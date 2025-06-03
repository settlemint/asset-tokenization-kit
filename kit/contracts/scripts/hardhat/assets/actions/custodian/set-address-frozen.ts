import { SMARTContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const setAddressFrozen = async (
  asset: Asset<any>,
  custodian: AbstractActor,
  address: AbstractActor,
  frozen: boolean
) => {
  const tokenContract = custodian.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartCustodian,
  });

  const transactionHash = await tokenContract.write.setAddressFrozen([
    address.address,
    frozen,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Set address frozen] ${address.name} (${address.address}) frozen: ${frozen} for ${asset.name} (${asset.address})`
  );
};
