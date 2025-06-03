import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

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

  const transactionHash = await scheduleContract.write.claimYield();
  await waitForSuccess(transactionHash);

  console.log(
    `[Claim yield] ${asset.symbol} yield claimed for ${scheduleAddress}.`
  );
};
