import { ATKContracts } from "../../../constants/contracts";
import type { Actor } from "../../../entities/actor";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const redeem = async (
  asset: Asset<any>,
  actor: Actor,
  amount: string | number | bigint
) => {
  console.log(`[Redeemed] → Starting redemption...`);

  const redeemableContract = actor.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartRedeemable,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);
  const transactionHash = await withDecodedRevertReason(() =>
    redeemableContract.write.redeem([tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Redeemed] ✓ ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} redeemed from ${asset.name} (${asset.address})`
  );
};
