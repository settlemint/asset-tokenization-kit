import { atkDeployer } from "../services/deployer";
import { withDecodedRevertReason } from "../utils/decode-revert-reason";
import { encodeCountryParams } from "../utils/encode-country-params";
import { waitForSuccess } from "../utils/wait-for-success";

export const setGlobalBlockedCountries = async (countryCodes: number[]) => {
  console.log(`[Set global blocked countries] → Starting country blocking...`);

  const countryBlockListModule =
    atkDeployer.getCountryBlockListModuleContract();

  const compliance = atkDeployer.getComplianceContract();

  const transactionHash = await withDecodedRevertReason(() =>
    compliance.write.addGlobalComplianceModule([
      countryBlockListModule.address,
      encodeCountryParams(countryCodes),
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set global blocked countries] ✓ ${countryCodes.join(", ")} blocked globally`
  );
};
