import { ATKContracts } from "../../../constants/contracts";
import type { AbstractActor } from "../../../entities/actors/abstract-actor";
import { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { formatBaseUnits } from "../../../utils/format-base-units";
import { toBaseUnits } from "../../../utils/to-base-units";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const freezePartialTokens = async (
  asset: Asset<any>,
  custodian: AbstractActor,
  address: AbstractActor,
  amount: bigint
) => {
  const tokenContract = custodian.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismartCustodian,
  });

  const tokenAmount = toBaseUnits(amount, asset.decimals);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.freezePartialTokens([address.address, tokenAmount])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Freeze partial tokens] ${address.name} (${address.address}) frozen: ${formatBaseUnits(tokenAmount, asset.decimals)} for ${asset.name} (${asset.address})`
  );
};
