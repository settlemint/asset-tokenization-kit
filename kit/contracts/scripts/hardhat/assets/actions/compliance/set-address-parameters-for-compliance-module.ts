import { type Address, encodeAbiParameters, parseAbiParameters } from 'viem';
import { ATKContracts } from '../../../constants/contracts';
import { owner } from '../../../entities/actors/owner';
import type { Asset } from '../../../entities/asset';
import { atkDeployer } from '../../../services/deployer';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { waitForSuccess } from '../../../utils/wait-for-success';

export const setAddressParametersForComplianceModule = async (
  asset: Asset<any>,
  module: 'identityAllowListModule' | 'identityBlockListModule',
  addresses: Address[]
) => {
  console.log(
    `[Set parameters for ${module} compliance module] → Starting parameter setting...`
  );

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const encodedAddresses = encodeAbiParameters(
    parseAbiParameters('address[]'),
    [addresses]
  );

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setParametersForComplianceModule([
      atkDeployer.getContractAddress(module),
      encodedAddresses,
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Set parameters for ${module} compliance module] ✓ ${addresses.join(', ')} set for ${asset.name} (${asset.address})`
  );
};
