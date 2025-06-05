import { Address } from "viem";
import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatDecimals } from "../../../utils/format-decimals";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const approve = async (
  asset: Asset<any>,
  to: Address,
  amount: bigint
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const tokenAmount = toDecimals(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.approve([to, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Approve] ${formatDecimals(tokenAmount, asset.decimals)} ${asset.symbol} tokens to ${to}`
  );
};
