import { ATKContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatDecimals } from "../../../utils/format-decimals";
import { toDecimals } from "../../../utils/to-decimals";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const setCap = async (asset: Asset<any>, amount: bigint) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartCapped,
  });

  const tokenAmount = toDecimals(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setCap([tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set Cap] ${formatDecimals(tokenAmount, asset.decimals)} ${asset.symbol} tokens`
  );
};
