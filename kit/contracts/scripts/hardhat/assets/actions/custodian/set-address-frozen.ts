import { ATKContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const setAddressFrozen = async (
  asset: Asset<any>,
  custodian: AbstractActor,
  address: AbstractActor,
  frozen: boolean
) => {
  const tokenContract = custodian.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartCustodian,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setAddressFrozen([address.address, frozen])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set address frozen] ${address.name} (${address.address}) frozen: ${frozen} for ${asset.name} (${asset.address})`
  );
};
