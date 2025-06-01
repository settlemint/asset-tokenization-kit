import type { Address } from "viem";
import { SMARTTopic } from "../constants/topics";
import { smartProtocolDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { waitForSuccess } from "../utils/wait-for-success";
export const addTrustedIssuer = async (
  trustedIssuerIdentity: Address,
  claimTopics: bigint[] = [
    topicManager.getTopicId(SMARTTopic.kyc),
    topicManager.getTopicId(SMARTTopic.aml),
    topicManager.getTopicId(SMARTTopic.collateral),
  ],
) => {
  // Set up the claim issuer as a trusted issuer
  const trustedIssuersRegistry =
    smartProtocolDeployer.getTrustedIssuersRegistryContract();

  const transactionHash = await trustedIssuersRegistry.write.addTrustedIssuer([
    trustedIssuerIdentity,
    claimTopics,
  ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Add trusted issuer] ${trustedIssuerIdentity} added to registry`,
  );
};
