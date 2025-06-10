import { ATKContracts } from "../../../constants/contracts";
import { AbstractActor } from "../../../entities/actors/abstract-actor";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatDecimals } from "../../../utils/format-decimals";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const redeem = async (
  asset: Asset<any>,
  actor: AbstractActor,
  amount: bigint
) => {
  const redeemableContract = actor.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartRedeemable,
  });

  const tokenAmount = toDecimals(amount, asset.decimals);
  const transactionHash = await withDecodedRevertReason(() =>
    redeemableContract.write.redeem([tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Redeemed] ${formatDecimals(tokenAmount, asset.decimals)} redeemed from ${asset.name} (${asset.address})`
  );
};
