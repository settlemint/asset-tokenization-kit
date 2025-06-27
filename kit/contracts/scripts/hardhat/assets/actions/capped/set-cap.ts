import { ATKContracts } from '../../../constants/contracts';
import { owner } from '../../../entities/actors/owner';
import type { Asset } from '../../../entities/asset';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { formatBaseUnits } from '../../../utils/format-base-units';
import { toBaseUnits } from '../../../utils/to-base-units';
import { waitForSuccess } from '../../../utils/wait-for-success';

export const setCap = async (asset: Asset<any>, amount: bigint) => {
  console.log('[Set Cap] → Starting cap setting...');

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartCapped,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setCap([tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set Cap] ✓ Cap set to ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} tokens`
  );
};
