import { ATKContracts } from "../../../constants/contracts";
import { AbstractActor } from "../../../entities/actors/abstract-actor";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatDecimals } from "../../../utils/format-decimals";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const recoverErc20Tokens = async (
  asset: Asset<any>,
  actor: AbstractActor,
  assetToRecover: Asset<any>,
  to: AbstractActor,
  amount: bigint
) => {
  const tokenContract = actor.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.recoverERC20([
      assetToRecover.address,
      to.address,
      toDecimals(amount, assetToRecover.decimals),
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Recover ERC20 tokens] ${actor.name} recovered ${formatDecimals(amount, assetToRecover.decimals)} ${assetToRecover.symbol} tokens from ${assetToRecover.name} (${assetToRecover.address}) to ${to.name} (${to.address})`
  );
};
