import { ATKContracts } from '../../../constants/contracts';
import { owner } from '../../../entities/actors/owner';
import type { Asset } from '../../../entities/asset';
import { getAnvilTimeSeconds, increaseAnvilTime } from '../../../utils/anvil';
import { waitForSuccess } from '../../../utils/wait-for-success';

export const mature = async (asset: Asset<'bondFactory'>) => {
  console.log('[Bond matured] → Starting bond maturation...');

  const bondContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.bond,
  });

  const isMatured = await bondContract.read.isMatured();
  if (isMatured) {
    console.log(
      `[Bond matured] ✓ ${asset.name} (${asset.address}) already matured`
    );
    return;
  }

  const maturityDate = await bondContract.read.maturityDate();

  const anvilTime = await getAnvilTimeSeconds(owner);
  const timeUntilMaturity = Number(maturityDate) - anvilTime;
  console.log(
    `[Bond] Maturity date: ${new Date(Number(maturityDate) * 1000).toISOString()}, time until maturity: ${timeUntilMaturity} seconds`
  );
  if (timeUntilMaturity > 0) {
    await increaseAnvilTime(owner, timeUntilMaturity);
  }

  const transactionHash = await bondContract.write.mature();

  await waitForSuccess(transactionHash);

  console.log(
    `[Bond matured] ✓ ${asset.name} (${asset.address}) matured successfully`
  );
};
