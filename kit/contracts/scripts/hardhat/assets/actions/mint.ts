import type { Address } from "viem";
import type { AbstractActor } from "../../actors/abstract-actor";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";
import { formatDecimals } from "../../utils/format-decimals";
import { toDecimals } from "../../utils/to-decimals";
import { waitForSuccess } from "../../utils/wait-for-success";

export const mint = async (
  tokenAddress: Address,
  to: AbstractActor,
  amount: bigint,
  decimals: number
) => {
  const tokenContract = owner.getContractInstance({
    address: tokenAddress,
    abi: SMARTContracts.ismart,
  });

  const tokenAmount = toDecimals(amount, decimals);

  const transactionHash = await tokenContract.write.mint([
    to.address,
    tokenAmount,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Mint] ${formatDecimals(tokenAmount, decimals)} tokens to ${to.name} (${to.address})`
  );
};
