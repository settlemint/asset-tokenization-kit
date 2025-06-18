import type { Address } from "viem";
import { ATKContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const removeComplianceModule = async (
  asset: Asset<any>,
  moduleAddress: Address
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address!,
    abi: ATKContracts.ismart,
  });

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.removeComplianceModule([moduleAddress])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Remove Compliance Module] ${moduleAddress} for ${asset.name} (${asset.address})`
  );
};
