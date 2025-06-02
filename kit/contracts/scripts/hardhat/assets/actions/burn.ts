import type { AbstractActor } from "../../actors/abstract-actor";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";
import type { Asset } from "../../types/asset";
import { formatDecimals } from "../../utils/format-decimals";
import { toDecimals } from "../../utils/to-decimals";
import { waitForSuccess } from "../../utils/wait-for-success";

export const burn = async (
  asset: Asset,
  from: AbstractActor,
  amount: bigint,
  decimals: number
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartBurnable,
  });

  const tokenAmount = toDecimals(amount, decimals);

  const transactionHash = await tokenContract.write.burn([
    from.address,
    tokenAmount,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Burn] ${formatDecimals(tokenAmount, decimals)} ${asset.symbol} tokens from ${from.name} (${from.address})`
  );
};
