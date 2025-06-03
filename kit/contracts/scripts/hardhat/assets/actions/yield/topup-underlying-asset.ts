import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { waitForEvent } from "../../../utils/wait-for-event";

export const topupUnderlyingAsset = async (
  asset: Asset<any>,
  amount: bigint
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartYield,
  });

  const scheduleAddress = await tokenContract.read.yieldSchedule();
  const scheduleContract = owner.getContractInstance({
    address: scheduleAddress,
    abi: SMARTContracts.ismartFixedYieldSchedule,
  });

  const transactionHash = await scheduleContract.write.topUpUnderlyingAsset([
    amount,
  ]);
  await waitForEvent({
    transactionHash,
    contract: scheduleContract,
    eventName: "UnderlyingAssetTopUp",
  });

  console.log(
    `[Topup underlying asset] ${asset.symbol} underlying asset topped up with amount ${amount}.`
  );
};
