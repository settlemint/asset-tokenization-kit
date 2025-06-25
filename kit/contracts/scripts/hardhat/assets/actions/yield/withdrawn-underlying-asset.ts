import { Address } from "viem";
import { ATKContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForEvent } from "../../../utils/wait-for-event";

export const withdrawnUnderlyingAsset = async (
  asset: Asset<any>,
  underlyingAsset: Asset<any>,
  to: Address,
  amount: bigint
) => {
  console.log(
    `[Withdrawn underlying asset] → Starting underlying asset withdrawal...`
  );

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartYield,
  });

  const scheduleAddress = await tokenContract.read.yieldSchedule();
  const scheduleContract = owner.getContractInstance({
    address: scheduleAddress,
    abi: ATKContracts.ismartFixedYieldSchedule,
  });

  const withdrawnAmount = toBaseUnits(amount, underlyingAsset.decimals);
  const transactionHash = await withDecodedRevertReason(() =>
    scheduleContract.write.withdrawUnderlyingAsset([to, withdrawnAmount])
  );
  await waitForEvent({
    transactionHash,
    contract: scheduleContract,
    eventName: "UnderlyingAssetWithdrawn",
  });

  console.log(
    `[Withdrawn underlying asset] ✓ ${asset.symbol} underlying asset withdrawn to ${to} with amount ${amount} ${underlyingAsset.symbol}`
  );
};
