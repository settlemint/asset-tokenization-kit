import { ATKContracts } from '../../../constants/contracts';
import type { AbstractActor } from '../../../entities/actors/abstract-actor';
import { owner } from '../../../entities/actors/owner';
import type { Asset } from '../../../entities/asset';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { formatBaseUnits } from '../../../utils/format-base-units';
import { toBaseUnits } from '../../../utils/to-base-units';
import { waitForSuccess } from '../../../utils/wait-for-success';

export const burn = async (
  asset: Asset<any>,
  from: AbstractActor,
  amount: bigint
) => {
  console.log('[Burn] → Starting burn operation...');

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartBurnable,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.burn([from.address, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Burn] ✓ ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} tokens burned from ${from.name} (${from.address})`
  );
};
