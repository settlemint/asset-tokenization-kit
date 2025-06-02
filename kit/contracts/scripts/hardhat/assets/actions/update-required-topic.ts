import { owner } from "../../actors/owner";
import { SMARTContracts } from "../../constants/contracts";
import type { SMARTTopic } from "../../constants/topics";
import { topicManager } from "../../services/topic-manager";
import type { Asset } from "../../types/asset";
import { waitForSuccess } from "../../utils/wait-for-success";

export const updateRequiredTopics = async (
  asset: Asset,
  topicNames: SMARTTopic[]
) => {
  const tokenContract = owner.getContractInstance({
    address: asset.address,
    abi: SMARTContracts.ismart,
  });

  const topicIds = topicNames.map((name) => topicManager.getTopicId(name));

  const transactionHash = await tokenContract.write.setRequiredClaimTopics([
    topicIds,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Update Required Topics] ${topicNames.map((name) => name).join(", ")} for ${asset.name} (${asset.address})`
  );
};
