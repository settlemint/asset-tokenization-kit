import { Address } from "viem";
import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { ATKRoles } from "../../../constants/roles";
import { Asset } from "../../../entities/asset";
import { atkDeployer } from "../../../services/deployer";
import { increaseAnvilTime } from "../../../utils/anvil";
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
  interval: number,
  /** The country code for the yield schedule. */
  countryCode: number
) => {
  console.log(`[Set yield schedule] → Starting yield schedule setup...`);

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartYield,
  });

  // Get the access manager address from the asset object
  const accessManagerAddress = asset.accessManager;

  // Get the access manager contract
  const accessManagerContract = owner.getContractInstance({
    address: accessManagerAddress,
    abi: ATKContracts.accessManager,
  });

  // Grant GOVERNANCE_ROLE to owner so they can call setYieldSchedule
  const grantGovRoleHash = await withDecodedRevertReason(() =>
    accessManagerContract.write.grantRole([
      ATKRoles.governanceRole,
      owner.address,
    ])
  );
  await waitForSuccess(grantGovRoleHash);
  console.log(
    `[Set yield schedule] ✓ Granted GOVERNANCE_ROLE to ${owner.address}`
  );

  // Get the system address for granting DEPLOYER_ROLE to owner
  const systemAddress = atkDeployer.getContractAddress("system");
  const systemContract = owner.getContractInstance({
    address: systemAddress,
    abi: ATKContracts.system,
  });

  // Get the system access manager address from the system contract
  const systemAccessManagerAddress =
    await systemContract.read.systemAccessManager();

  // Get the system access manager contract
  const systemAccessManagerContract = owner.getContractInstance({
    address: systemAccessManagerAddress,
    abi: ATKContracts.accessManager,
  });

  // Grant DEPLOYER_ROLE to owner so they can call fixedYieldScheduleFactory.create
  const grantDeployerRoleHash = await withDecodedRevertReason(() =>
    systemAccessManagerContract.write.grantRole([
      ATKRoles.deployerRole,
      owner.address,
    ])
  );
  await waitForSuccess(grantDeployerRoleHash);
  console.log(
    `[Set yield schedule] ✓ Granted DEPLOYER_ROLE to ${owner.address}`
  );

  const factoryAddress = atkDeployer.getContractAddress(
    "fixedYieldScheduleFactory"
  );
  const factoryContract = owner.getContractInstance({
    address: factoryAddress,
    abi: ATKContracts.fixedYieldScheduleFactory,
  });

  const createYieldScheduleTransactionHash = await withDecodedRevertReason(() =>
    factoryContract.write.create([
      tokenContract.address,
      BigInt(Math.ceil(startTime.getTime() / 1000)),
      BigInt(Math.ceil(endTime.getTime() / 1000)),
      BigInt(rate),
      BigInt(interval),
      countryCode,
    ])
  );
  const { schedule } = (await waitForEvent({
    transactionHash: createYieldScheduleTransactionHash,
    contract: factoryContract,
    eventName: "ATKFixedYieldScheduleCreated",
  })) as { schedule: Address };

  const setYieldScheduleTransactionHash =
    await tokenContract.write.setYieldSchedule([schedule]);
  await waitForSuccess(setYieldScheduleTransactionHash);

  const scheduleContract = owner.getContractInstance({
    address: schedule,
    abi: ATKContracts.fixedYieldSchedule,
  });

  await scheduleContract.write.grantRole([
    ATKRoles.governanceRole,
    owner.address,
  ]);
  await scheduleContract.write.grantRole([
    ATKRoles.supplyManagementRole,
    owner.address,
  ]);

  console.log(
    `[Set yield schedule] ✓ ${asset.symbol} yield schedule set with start time ${startTime.toISOString()} and end time ${endTime.toISOString()} (schedule address ${schedule})`
  );

  return {
    scheduleContract,
    advanceToNextPeriod: async (): Promise<boolean> => {
      const totalPeriods = Math.floor(
        (endTime.getTime() - startTime.getTime()) / (interval * 1000)
      );
      const lastCompletedPeriodBefore =
        await scheduleContract.read.lastCompletedPeriod();

      if (Number(lastCompletedPeriodBefore) >= totalPeriods) {
        console.log(
          `[Yield schedule] ${asset.symbol} schedule has already completed all ${totalPeriods} periods. Cannot advance further.`
        );
        return false;
      }

      const currentPeriod = await scheduleContract.read.currentPeriod();
      const timeUntilNextPeriod =
        await scheduleContract.read.timeUntilNextPeriod();

      await increaseAnvilTime(owner, Number(timeUntilNextPeriod));

      if (currentPeriod.toString() === "0") {
        const timeToFirstPeriodCompleted =
          await scheduleContract.read.timeUntilNextPeriod();
        await increaseAnvilTime(owner, Number(timeToFirstPeriodCompleted));
      }
      const lastCompletedPeriod =
        await scheduleContract.read.lastCompletedPeriod();
      const newPeriod = await scheduleContract.read.currentPeriod();
      console.log(
        `[Yield schedule] ${asset.symbol} period advanced from ${currentPeriod} to ${newPeriod}, last completed period is now ${lastCompletedPeriod}`
      );
      return true;
    },
  };
};
