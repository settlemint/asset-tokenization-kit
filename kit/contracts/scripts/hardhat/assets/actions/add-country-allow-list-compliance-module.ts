import { encodeAbiParameters, parseAbiParameters } from "viem";
import { SMARTContracts } from "../../constants/contracts";
import { owner } from "../../entities/actors/owner";
import type { Asset } from "../../entities/asset";
import { smartProtocolDeployer } from "../../services/deployer";
import { waitForSuccess } from "../../utils/wait-for-success";

export const addCountryAllowListComplianceModule = async (
  asset: Asset<any>,
  countryCodes: number[]
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const encodedCountries = encodeAbiParameters(parseAbiParameters("uint16[]"), [
    countryCodes,
  ]);

  const transactionHash = await tokenContract.write.addComplianceModule([
    smartProtocolDeployer.getContractAddress("countryAllowListModule"),
    encodedCountries,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Add country allow list compliance module] ${countryCodes.join(", ")} for ${asset.name} (${asset.address})`
  );
};
