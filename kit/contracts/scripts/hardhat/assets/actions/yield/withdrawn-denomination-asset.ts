import type { Address } from "viem";
import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForEvent } from "../../../utils/wait-for-event";

export const withdrawnDenominationAsset = async (
  asset: Asset<any>,
  denominationAsset: Asset<any>,
  to: Address,
  amount: bigint
) => {
  console.log(
    `[Withdrawn denomination asset] → Starting denomination asset withdrawal...`
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

  const withdrawnAmount = toBaseUnits(amount, denominationAsset.decimals);
  const transactionHash = await withDecodedRevertReason(() =>
    scheduleContract.write.withdrawDenominationAsset([to, withdrawnAmount])
  );
  await waitForEvent({
    transactionHash,
    contract: scheduleContract,
    eventName: "DenominationAssetWithdrawn",
  });

  console.log(
    `[Withdrawn denomination asset] ✓ ${asset.symbol} denomination asset withdrawn to ${to} with amount ${amount} ${denominationAsset.symbol}`
  );
};
