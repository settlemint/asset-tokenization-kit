import type { Address } from "viem";
import { SMARTContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const removeComplianceModule = async (
  asset: Asset<any>,
  moduleAddress: Address
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address!,
    abi: SMARTContracts.ismart,
  });

  const transactionHash = await tokenContract.write.removeComplianceModule([
    moduleAddress,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Remove Compliance Module] ${moduleAddress} for ${asset.name} (${asset.address})`
  );
};
