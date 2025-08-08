import { ATKContracts } from "../../../constants/contracts";
import type { Actor } from "../../../entities/actor";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { waitForEvent } from "../../../utils/wait-for-event";

export const claimYield = async (
  asset: Asset<any>,
  denominationAsset: Asset<any>,
  actor: Actor
) => {
  console.log(`[Claim yield] → Starting yield claim...`);

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
    eventName: "YieldClaimed",
  });

  const { claimedAmount, fromPeriod, toPeriod } = eventArgs as {
    claimedAmount: bigint;
    fromPeriod: bigint;
    toPeriod: bigint;
    periodAmounts: readonly bigint[];
    periodYields: readonly bigint[];
  };

  console.log(
    `[Claim yield] ✓ ${formatBaseUnits(claimedAmount, denominationAsset.decimals)} ${denominationAsset.symbol} yield claimed from period ${fromPeriod} to ${toPeriod}`
  );
};
