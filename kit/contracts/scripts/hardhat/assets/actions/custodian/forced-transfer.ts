import { ATKContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const forcedTransfer = async (
  asset: Asset<any>,
  custodian: AbstractActor,
  from: AbstractActor | Asset<any>,
  to: AbstractActor | Asset<any>,
  amount: bigint
) => {
  const custodianContract = custodian.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartCustodian,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    custodianContract.write.forcedTransfer([
      from.address,
      to.address,
      tokenAmount,
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Forced transfer] ${from.name} (${from.address}) transferred ${formatBaseUnits(tokenAmount, asset.decimals)} ${asset.symbol} tokens to ${to.name} (${to.address})`
  );
};
