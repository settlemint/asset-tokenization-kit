import { encodeAbiParameters, parseAbiParameters } from "viem";
import { ATKContracts } from "../../../constants/contracts";
import { owner } from "../../../entities/actors/owner";
import { Asset } from "../../../entities/asset";
import { atkDeployer } from "../../../services/deployer";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";
export const setCountryParametersForComplianceModule = async (
  asset: Asset<any>,
  module: "countryBlockListModule" | "countryAllowListModule",
  countryCodes: number[]
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const encodedCountries = encodeAbiParameters(parseAbiParameters("uint16[]"), [
    countryCodes,
  ]);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setParametersForComplianceModule([
      atkDeployer.getContractAddress(module),
      encodedCountries,
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set parameters for ${module} compliance module] ${countryCodes.join(", ")} for ${asset.name} (${asset.address})`
  );
};
