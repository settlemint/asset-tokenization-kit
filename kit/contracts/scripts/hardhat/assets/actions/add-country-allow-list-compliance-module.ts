import { encodeAbiParameters, parseAbiParameters } from "viem";
import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";
import { smartProtocolDeployer } from "../../services/deployer";
import type { Asset } from "../../types/asset";
import { waitForSuccess } from "../../utils/wait-for-success";

export const addCountryAllowListComplianceModule = async (
  asset: Asset,
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
