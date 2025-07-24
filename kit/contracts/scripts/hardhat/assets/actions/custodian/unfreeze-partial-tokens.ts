import { ATKContracts } from "../../../constants/contracts";
import type { Actor } from "../../../entities/actor";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const unfreezePartialTokens = async (
  asset: Asset<any>,
  custodian: Actor,
  address: Actor,
  amount: bigint
) => {
  console.log(
    `[Unfreeze partial tokens] → Starting partial token unfreezing...`
  );

  const tokenContract = custodian.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartCustodian,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.unfreezePartialTokens([address.address, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Unfreeze partial tokens] ✓ ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} tokens unfrozen for ${address.name} (${address.address}) on ${asset.name} (${asset.address})`
  );
};
