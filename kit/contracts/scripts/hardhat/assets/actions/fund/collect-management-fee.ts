import { ATKContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { increaseAnvilTime } from "../../../utils/anvil";
import { formatDecimals } from "../../../utils/format-decimals";
import { waitForEvent } from "../../../utils/wait-for-event";

export const collectManagementFee = async (
  asset: Asset<"fundFactory">,
  waitTimeInDays: number
) => {
  const fundContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.fund,
  });

  await increaseAnvilTime(owner, waitTimeInDays * 24 * 60 * 60);

  const transactionHash = await fundContract.write.collectManagementFee();

  const { amount } = (await waitForEvent({
    transactionHash,
    contract: fundContract,
    eventName: "ManagementFeeCollected",
  })) as { amount: bigint };

  console.log(
    `[Fund management fee collected] ${formatDecimals(amount, 0)} collected for ${asset.name} (${asset.address})`
  );
};
