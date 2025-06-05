import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForEvent } from "../../../utils/wait-for-event";

export const claimYield = async (asset: Asset<any>) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartYield,
  });

  const scheduleAddress = await tokenContract.read.yieldSchedule();
  const scheduleContract = owner.getContractInstance({
    address: scheduleAddress,
    abi: SMARTContracts.ismartFixedYieldSchedule,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    scheduleContract.write.claimYield()
  );
  await waitForEvent({
    transactionHash,
    contract: scheduleContract,
    eventName: "YieldClaimed",
  });

  console.log(`[Claim yield] ${asset.symbol} yield claimed`);
};
