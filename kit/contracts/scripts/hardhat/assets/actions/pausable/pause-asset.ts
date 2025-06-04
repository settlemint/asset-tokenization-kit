import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const pauseAsset = async (asset: Asset<any>) => {
  const pausableContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartPausable,
  });

  const transactionHash = await pausableContract.write.pause();

  await waitForSuccess(transactionHash);

  console.log(`[Paused] ${asset.name} (${asset.address})`);
};
