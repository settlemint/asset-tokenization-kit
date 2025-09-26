import type { Address } from "viem";
import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const approve = async (
  asset: Asset<any>,
  to: Address,
  amount: bigint
) => {
  console.log(`[Approve] → Starting approval operation...`);

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.approve([to, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Approve] ✓ ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} tokens approved to ${to}`
  );
};
