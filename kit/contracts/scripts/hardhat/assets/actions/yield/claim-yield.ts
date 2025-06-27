import { ATKContracts } from '../../../constants/contracts';
import type { AbstractActor } from '../../../entities/actors/abstract-actor';
import type { Asset } from '../../../entities/asset';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { formatBaseUnits } from '../../../utils/format-base-units';
import { waitForEvent } from '../../../utils/wait-for-event';

export const claimYield = async (
  asset: Asset<any>,
  underlyingAsset: Asset<any>,
  actor: AbstractActor
) => {
  console.log('[Claim yield] → Starting yield claim...');

  const tokenContract = actor.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartYield,
  });

  const scheduleAddress = await tokenContract.read.yieldSchedule();
  const scheduleContract = actor.getContractInstance({
    address: scheduleAddress,
    abi: ATKContracts.ismartFixedYieldSchedule,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    scheduleContract.write.claimYield()
  );
  const eventArgs = await waitForEvent({
    transactionHash,
    contract: scheduleContract,
    eventName: 'YieldClaimed',
  });

  const { claimedAmount, fromPeriod, toPeriod, periodAmounts, periodYields } =
    eventArgs as {
      claimedAmount: bigint;
      fromPeriod: bigint;
      toPeriod: bigint;
      periodAmounts: readonly bigint[];
      periodYields: readonly bigint[];
    };

  console.log(
    `[Claim yield] ✓ ${formatBaseUnits(claimedAmount, underlyingAsset.decimals)} ${underlyingAsset.symbol} yield claimed from period ${fromPeriod} to ${toPeriod}`
  );
};
