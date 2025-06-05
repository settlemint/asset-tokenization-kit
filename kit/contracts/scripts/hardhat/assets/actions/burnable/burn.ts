import { SMARTContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatDecimals } from "../../../utils/format-decimals";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const burn = async (
  asset: Asset<any>,
  from: AbstractActor,
  amount: bigint
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismartBurnable,
  });

  const tokenAmount = toDecimals(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.burn([from.address, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Burn] ${formatDecimals(tokenAmount, asset.decimals)} ${asset.symbol} tokens from ${from.name} (${from.address})`
  );
};
