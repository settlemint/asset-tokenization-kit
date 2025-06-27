import { ATKContracts } from '../../../constants/contracts';
import type { AbstractActor } from '../../../entities/actors/abstract-actor';
import type { Asset } from '../../../entities/asset';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { formatBaseUnits } from '../../../utils/format-base-units';
import { toBaseUnits } from '../../../utils/to-base-units';
import { waitForSuccess } from '../../../utils/wait-for-success';

export const recoverErc20Tokens = async (
  asset: Asset<any>,
  actor: AbstractActor,
  assetToRecover: Asset<any>,
  to: AbstractActor,
  amount: bigint
) => {
  console.log('[Recover ERC20 tokens] → Starting token recovery...');

  const tokenContract = actor.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.recoverERC20([
      assetToRecover.address,
      to.address,
      toBaseUnits(amount, assetToRecover.decimals),
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Recover ERC20 tokens] ✓ ${actor.name} recovered ${formatBaseUnits(amount, assetToRecover.decimals)} ${assetToRecover.symbol} tokens from ${assetToRecover.name} (${assetToRecover.address}) to ${to.name} (${to.address})`
  );
};
