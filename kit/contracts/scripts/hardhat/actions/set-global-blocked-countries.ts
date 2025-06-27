import { atkDeployer } from '../services/deployer';
import { waitForSuccess } from '../utils/wait-for-success';

export const setGlobalBlockedCountries = async (countryCodes: number[]) => {
  console.log('[Set global blocked countries] → Starting country blocking...');

  const countryBlockListModule =
    atkDeployer.getCountryBlockListModuleContract();

  const transactionHash =
    await countryBlockListModule.write.setGlobalBlockedCountries([
      countryCodes,
      true,
    ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Set global blocked countries] ✓ ${countryCodes.join(', ')} blocked globally`
  );
};
