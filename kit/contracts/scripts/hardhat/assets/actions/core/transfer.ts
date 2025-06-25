import { ATKContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const transfer = async (
  asset: Asset<any>,
  from: AbstractActor,
  to: AbstractActor | Asset<any>,
  amount: bigint
) => {
  console.log(`[Transfer] → Starting transfer operation...`);
  
  const tokenContract = from.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.transfer([to.address, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Transfer] ✓ ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} tokens transferred from ${from.name} (${from.address}) to ${to.name} (${to.address})`
  );
};
