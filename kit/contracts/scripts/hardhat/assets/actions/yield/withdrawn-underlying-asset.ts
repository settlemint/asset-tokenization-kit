import { Address } from "viem";
import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { waitForEvent } from "../../../utils/wait-for-event";

export const withdrawnUnderlyingAsset = async (
  asset: Asset<any>,
  to: Address,
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

  const transactionHash = await scheduleContract.write.withdrawUnderlyingAsset([
    to,
    amount,
  ]);
  await waitForEvent({
    transactionHash,
    contract: scheduleContract,
    eventName: "UnderlyingAssetWithdrawn",
  });

  console.log(
    `[Withdrawn underlying asset] ${asset.symbol} underlying asset withdrawn to ${to} with amount ${amount}.`
  );
};
