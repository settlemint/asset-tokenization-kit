import { ATKContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const unpauseAsset = async (asset: Asset<any>) => {
  console.log(`[Unpaused] → Starting asset unpause...`);
  
  const pausableContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartPausable,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    pausableContract.write.unpause()
  );

  await waitForSuccess(transactionHash);

  console.log(`[Unpaused] ✓ ${asset.name} (${asset.address}) unpaused successfully`);
};
