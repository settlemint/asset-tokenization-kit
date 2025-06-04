import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const unpauseAsset = async (asset: Asset<any>) => {
  const pausableContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartPausable,
  });

  const transactionHash = await pausableContract.write.unpause();

  await waitForSuccess(transactionHash);

  console.log(`[Unpaused] ${asset.name} (${asset.address})`);
};
