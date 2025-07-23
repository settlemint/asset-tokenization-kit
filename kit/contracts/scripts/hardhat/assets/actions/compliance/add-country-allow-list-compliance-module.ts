import { owner } from "../../../constants/actors";
import { ATKContracts } from "../../../constants/contracts";
import type { Asset } from "../../../entities/asset";
import { atkDeployer } from "../../../services/deployer";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";
import { encodeCountryParams } from "../../utils/encode-country-params";

export const addCountryComplianceModule = async (
  asset: Asset<any>,
  module: "countryBlockListModule" | "countryAllowListModule",
  countryCodes: number[]
) => {
  console.log(
    `[Add country ${module} compliance module] → Starting module addition...`
  );

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const encodedCountries = encodeCountryParams(countryCodes);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.addComplianceModule([
      atkDeployer.getContractAddress(module),
      encodedCountries,
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Add country ${module} compliance module] ✓ ${countryCodes.join(", ")} added for ${asset.name} (${asset.address})`
  );
};
