import { Address } from "viem";
import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { smartProtocolDeployer } from "../../../services/deployer";
import { mineAnvilBlock } from "../../../utils/anvil";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForEvent } from "../../../utils/wait-for-event";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const setYieldSchedule = async (
  asset: Asset<any>,
  startTime: Date,
  endTime: Date,
  /** The yield rate in basis points (e.g., 500 for 5%). Must be greater than 0. */
  rate: number,
  /** The interval between yield distributions in seconds (e.g., 86400 for daily). Must be greater than 0. */
  interval: number
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartYield,
  });

  const factoryAddress = smartProtocolDeployer.getContractAddress(
    "fixedYieldScheduleFactory"
  );
  const factoryContract = owner.getContractInstance({
    address: factoryAddress,
    abi: SMARTContracts.fixedYieldScheduleFactory,
  });

  const createYieldScheduleTransactionHash = await withDecodedRevertReason(() =>
    factoryContract.write.create([
      tokenContract.address,
      BigInt(Math.ceil(startTime.getTime() / 1000)),
      BigInt(Math.ceil(endTime.getTime() / 1000)),
      BigInt(rate),
      BigInt(interval),
    ])
  );
  const { schedule } = (await waitForEvent({
    transactionHash: createYieldScheduleTransactionHash,
    contract: factoryContract,
    eventName: "SMARTFixedYieldScheduleCreated",
  })) as { schedule: Address };

  const setYieldScheduleTransactionHash =
    await tokenContract.write.setYieldSchedule([schedule]);
  await waitForSuccess(setYieldScheduleTransactionHash);

  const scheduleContract = owner.getContractInstance({
    address: schedule,
    abi: SMARTContracts.ismartFixedYieldSchedule,
  });

  console.log(
    `[Set yield schedule] ${asset.symbol} yield schedule set with start time ${startTime.toISOString()} and end time ${endTime.toISOString()} (schedule address ${schedule})`
  );

  return {
    advanceToNextPeriod: async () => {
      const time = await scheduleContract.read.timeUntilNextPeriod();
      await new Promise((resolve) => setTimeout(resolve, Number(time) * 1_000));
      // Mine a block to advance the time
      await mineAnvilBlock(owner);
    },
  };
};
