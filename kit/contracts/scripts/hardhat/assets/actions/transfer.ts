import type { AbstractActor } from "../../actors/abstract-actor";
import { SMARTContracts } from "../../constants/contracts";
import type { Asset } from "../../types/asset";
import { formatDecimals } from "../../utils/format-decimals";
import { toDecimals } from "../../utils/to-decimals";
import { waitForSuccess } from "../../utils/wait-for-success";

export const transfer = async (
  asset: Asset,
  from: AbstractActor,
  to: AbstractActor,
  amount: bigint,
  decimals: number
) => {
  const tokenContract = from.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const tokenAmount = toDecimals(amount, decimals);

  const transactionHash = await tokenContract.write.transfer([
    to.address,
    tokenAmount,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Transfer] ${formatDecimals(tokenAmount, decimals)} ${asset.symbol} tokens from ${from.name} (${from.address}) to ${to.name} (${to.address})`
  );
};
