import type { Address } from "viem";
import type { AbstractActor } from "../../actors/abstract-actor";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";
import { formatDecimals } from "../../utils/format-decimals";
import { toDecimals } from "../../utils/to-decimals";
import { waitForSuccess } from "../../utils/wait-for-success";

export const burn = async (
  tokenAddress: Address,
  from: AbstractActor,
  amount: bigint,
  decimals: number
) => {
  const tokenContract = owner.getContractInstance({
    address: tokenAddress,
    abi: SMARTContracts.ismartBurnable,
  });

  const tokenAmount = toDecimals(amount, decimals);

  const transactionHash = await tokenContract.write.burn([
    from.address,
    tokenAmount,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Burn] ${formatDecimals(tokenAmount, decimals)} tokens from ${from.name} (${from.address})`
  );
};
