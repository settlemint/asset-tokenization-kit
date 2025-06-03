import { SMARTContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import type { Asset } from "../../../entities/asset";
import { formatDecimals } from "../../../utils/format-decimals";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const transfer = async (
  asset: Asset<any>,
  from: AbstractActor,
  to: AbstractActor | Asset<any>,
  amount: bigint
) => {
  const tokenContract = from.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const tokenAmount = toDecimals(amount, asset.decimals);

  const transactionHash = await tokenContract.write.transfer([
    to.address,
    tokenAmount,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Transfer] ${formatDecimals(tokenAmount, asset.decimals)} ${asset.symbol} tokens from ${from.name} (${from.address}) to ${to.name} (${to.address})`
  );
};
