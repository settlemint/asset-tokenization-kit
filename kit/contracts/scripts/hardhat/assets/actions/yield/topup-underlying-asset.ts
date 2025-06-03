import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { waitForEvent } from "../../../utils/wait-for-event";
import { approve } from "../core/approve";

export const topupUnderlyingAsset = async (
  asset: Asset<any>,
  underlyingAsset: Asset<any>,
  amount: bigint
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartYield,
  });

  const scheduleAddress = await tokenContract.read.yieldSchedule();
  await approve(underlyingAsset, scheduleAddress, amount);

  const scheduleContract = owner.getContractInstance({
    address: scheduleAddress,
    abi: SMARTContracts.ismartFixedYieldSchedule,
  });

  const topUpTransactionHash =
    await scheduleContract.write.topUpUnderlyingAsset([amount]);
  await waitForEvent({
    transactionHash: topUpTransactionHash,
    contract: scheduleContract,
    eventName: "UnderlyingAssetTopUp",
  });

  console.log(
    `[Topup underlying asset] ${asset.symbol} underlying asset topped up with amount ${amount}.`
  );
};
