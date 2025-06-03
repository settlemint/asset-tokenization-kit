import { SMARTContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { formatDecimals } from "../../../utils/format-decimals";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const mint = async (
  asset: Asset<any>,
  to: AbstractActor | Asset<any>,
  amount: bigint
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const tokenAmount = toDecimals(amount, asset.decimals);

  const transactionHash = await tokenContract.write.mint([
    to.address,
    tokenAmount,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Mint] ${formatDecimals(tokenAmount, asset.decimals)} ${asset.symbol} tokens to ${to.name} (${to.address})`
  );
};
