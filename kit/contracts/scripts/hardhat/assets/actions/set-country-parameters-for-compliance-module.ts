import { encodeAbiParameters, parseAbiParameters } from "viem";
import { SMARTContracts } from "../../constants/contracts";
import { owner } from "../../entities/actors/owner";
import { Asset } from "../../entities/asset";
import { smartProtocolDeployer } from "../../services/deployer";
import { waitForSuccess } from "../../utils/wait-for-success";
export const setCountryParametersForComplianceModule = async (
  asset: Asset<any>,
  module: "countryBlockListModule" | "countryAllowListModule",
  countryCodes: number[]
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const encodedCountries = encodeAbiParameters(parseAbiParameters("uint16[]"), [
    countryCodes,
  ]);

  const transactionHash =
    await tokenContract.write.setParametersForComplianceModule([
      smartProtocolDeployer.getContractAddress(module),
      encodedCountries,
    ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Set parameters for ${module} compliance module] ${countryCodes.join(", ")} for ${asset.name} (${asset.address})`
  );
};
