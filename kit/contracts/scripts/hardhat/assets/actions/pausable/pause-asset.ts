import { ATKContracts } from '../../../constants/contracts';
import { owner } from '../../../entities/actors/owner';
import type { Asset } from '../../../entities/asset';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { waitForSuccess } from '../../../utils/wait-for-success';

export const pauseAsset = async (asset: Asset<any>) => {
  console.log('[Paused] → Starting asset pause...');

  const pausableContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartPausable,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    pausableContract.write.pause()
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Paused] ✓ ${asset.name} (${asset.address}) paused successfully`
  );
};
