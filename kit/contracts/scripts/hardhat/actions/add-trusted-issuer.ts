import type { Address } from "viem";
import { ATKTopic } from "../constants/topics";
import { atkDeployer } from "../services/deployer";
import { topicManager } from "../services/topic-manager";
import { waitForSuccess } from "../utils/wait-for-success";
export const addTrustedIssuer = async (
  trustedIssuerIdentity: Address,
  claimTopics: bigint[] = [
    topicManager.getTopicId(ATKTopic.kyc),
    topicManager.getTopicId(ATKTopic.aml),
    topicManager.getTopicId(ATKTopic.collateral),
  ]
) => {
  console.log(`[Add trusted issuer] → Starting trusted issuer setup...`);

  // Set up the claim issuer as a trusted issuer
  const systemTrustedIssuersRegistry =
    atkDeployer.getSystemTrustedIssuersRegistryContract();

  const transactionHash =
    await systemTrustedIssuersRegistry.write.addTrustedIssuer([
      trustedIssuerIdentity,
      claimTopics,
    ]);

  await waitForSuccess(transactionHash);

  console.log(
    `[Add trusted issuer] ✓ ${trustedIssuerIdentity} added to registry`
  );
};
