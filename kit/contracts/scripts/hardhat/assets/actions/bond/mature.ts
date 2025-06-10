import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import {
  getLatestBlockTimestamp,
  increaseAnvilTime,
} from "../../../utils/anvil";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const mature = async (asset: Asset<"bondFactory">) => {
  const bondContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.bond,
  });

  const isMatured = await bondContract.read.isMatured();
  if (isMatured) {
    console.log(`[Bond matured] ${asset.name} (${asset.address})`);
    return;
  }

  const maturityDate = await bondContract.read.maturityDate();

  const latestBlockTimestamp = await getLatestBlockTimestamp(owner);
  const timeUntilMaturity = Number(maturityDate) - latestBlockTimestamp;
  console.log(
    `[Bond] Maturity date: ${new Date(Number(maturityDate) * 1000).toISOString()}, time until maturity: ${timeUntilMaturity} seconds`
  );
  await increaseAnvilTime(owner, timeUntilMaturity);

  const transactionHash = await bondContract.write.mature();

  await waitForSuccess(transactionHash);

  console.log(`[Bond matured] ${asset.name} (${asset.address})`);
};
