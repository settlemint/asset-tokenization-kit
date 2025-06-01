import type { Address } from "viem";
import type { AbstractActor } from "../../actors/abstract-actor";
import { SMARTContracts } from "../../constants/contracts";
import { formatDecimals } from "../../utils/format-decimals";
import { toDecimals } from "../../utils/to-decimals";
import { waitForSuccess } from "../../utils/wait-for-success";

export const transfer = async (
  tokenAddress: Address,
  from: AbstractActor,
  to: AbstractActor,
  amount: bigint,
  decimals: number,
) => {
  const tokenContract = from.getContractInstance({
    address: tokenAddress,
    abi: SMARTContracts.ismart,
  });

  const tokenAmount = toDecimals(amount, decimals);

  const transactionHash = await tokenContract.write.transfer([
    to.address,
    tokenAmount,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Transfer] ${formatDecimals(tokenAmount, decimals)} tokens from ${from.name} (${from.address}) to ${to.name} (${to.address})`,
  );
};
