import { smartProtocolDeployer } from "../services/deployer";
import { waitForSuccess } from "../utils/wait-for-success";

export const setGlobalBlockedCountries = async (countryCodes: number[]) => {
  const countryBlockListModule =
    smartProtocolDeployer.getCountryBlockListModuleContract();

  const transactionHash =
    await countryBlockListModule.write.setGlobalBlockedCountries([
      countryCodes,
      true,
    ]);

  await waitForSuccess(transactionHash);

  console.log(`[Set global blocked countries] ${countryCodes.join(", ")}`);
};
