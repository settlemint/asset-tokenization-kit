import { smartProtocolDeployer } from "../services/deployer";

import { SMARTRoles } from "../constants/roles";
import { SMARTTopic } from "../constants/topics";
import { owner } from "../entities/actors/owner";
import { Asset } from "../entities/asset";
import { topicManager } from "../services/topic-manager";
import { grantRoles } from "./actions/core/grant-roles";
import { pauseAsset } from "./actions/pausable/pause-asset";
import { unpauseAsset } from "./actions/pausable/unpause-asset";

export const createPausedAsset = async () => {
  console.log("\n=== Creating paused stablecoin... ===\n");

  const stablecoinFactory =
    smartProtocolDeployer.getStablecoinFactoryContract();

  const pausedStableCoin = new Asset<"stablecoinFactory">(
    "Paused Stablecoin",
    "PSD",
    6,
    "JP3902900005",
    stablecoinFactory
  );

  const transactionHash = await stablecoinFactory.write.createStableCoin([
    pausedStableCoin.name,
    pausedStableCoin.symbol,
    pausedStableCoin.decimals,
    [topicManager.getTopicId(SMARTTopic.kyc)],
    [],
  ]);

  await pausedStableCoin.waitUntilDeployed(transactionHash);

  await grantRoles(pausedStableCoin, owner, [SMARTRoles.emergencyRole]);

  await pauseAsset(pausedStableCoin);

  // triggers Unpause event
  await unpauseAsset(pausedStableCoin);

  // keep paused state
  await pauseAsset(pausedStableCoin);

  return pausedStableCoin;
};
