import { SMARTContracts } from "../../../constants/contracts";
import type { SMARTTopic } from "../../../constants/topics";
import { owner } from "../../../entities/actors/owner";
import type { Asset } from "../../../entities/asset";
import { topicManager } from "../../../services/topic-manager";
import { withDecodedRevertReason } from "../../../utils/decode-revert-reason";
import { waitForSuccess } from "../../../utils/wait-for-success";

export const updateRequiredTopics = async (
  asset: Asset<any>,
  topicNames: SMARTTopic[]
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const topicIds = topicNames.map((name) => topicManager.getTopicId(name));

  const transactionHash = await withDecodedRevertReason(() =>
    tokenContract.write.setRequiredClaimTopics([topicIds])
  );

  await waitForSuccess(transactionHash);

  console.log(
    `[Update Required Topics] ${topicNames.map((name) => name).join(", ")} for ${asset.name} (${asset.address})`
  );
};
