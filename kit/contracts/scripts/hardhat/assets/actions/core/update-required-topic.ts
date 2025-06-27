import { encodeAbiParameters, parseAbiParameters } from 'viem';
import { ATKContracts } from '../../../constants/contracts';
import type { ATKTopic } from '../../../constants/topics';
import { owner } from '../../../entities/actors/owner';
import type { Asset } from '../../../entities/asset';
import { atkDeployer } from '../../../services/deployer';
import { topicManager } from '../../../services/topic-manager';
import { withDecodedRevertReason } from '../../../utils/decode-revert-reason';
import { waitForSuccess } from '../../../utils/wait-for-success';

export const updateRequiredTopics = async (
  asset: Asset<any>,
  topicNames: ATKTopic[]
) => {
  console.log('[Update Required Topics] → Starting topic update...');

  const identityVerificationModuleAddress = await atkDeployer
    .getSystemContract()
    .read.identityVerificationModule();

  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: ATKContracts.ismart,
  });

  const topicIds = topicNames.map((name) => topicManager.getTopicId(name));

  const encodedTopicIds = encodeAbiParameters(parseAbiParameters('uint256[]'), [
    topicIds,
  ]);

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setParametersForComplianceModule([
      identityVerificationModuleAddress,
      encodedTopicIds,
    ])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Update Required Topics] ✓ ${topicNames.map((name) => name).join(', ')} set for ${asset.name} (${asset.address})`
  );
};
