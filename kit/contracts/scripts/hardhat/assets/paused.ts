import { ATKRoles } from '../constants/roles';
import { ATKTopic } from '../constants/topics';
import { owner } from '../entities/actors/owner';
import { Asset } from '../entities/asset';
import { atkDeployer } from '../services/deployer';
import { topicManager } from '../services/topic-manager';
import { grantRoles } from './actions/core/grant-roles';
import { issueBasePriceClaim } from './actions/core/issue-base-price-claim';
import { pauseAsset } from './actions/pausable/pause-asset';
import { unpauseAsset } from './actions/pausable/unpause-asset';

export const createPausedAsset = async () => {
  console.log('\n=== Creating paused stablecoin... ===\n');

  const stablecoinFactory = atkDeployer.getStablecoinFactoryContract();

  const pausedStableCoin = new Asset<'stablecoinFactory'>(
    'Paused Stablecoin',
    'PSD',
    6,
    'JP3902900005',
    stablecoinFactory
  );

  const transactionHash = await stablecoinFactory.write.createStableCoin([
    pausedStableCoin.name,
    pausedStableCoin.symbol,
    pausedStableCoin.decimals,
    [topicManager.getTopicId(ATKTopic.kyc)],
    [],
  ]);

  await pausedStableCoin.waitUntilDeployed(transactionHash);

  // needs to be done so that he can add the claims and also pause the asset
  await grantRoles(pausedStableCoin, owner, [
    ATKRoles.claimManagerRole,
    ATKRoles.emergencyRole,
  ]);

  // issue base price claim
  await issueBasePriceClaim(pausedStableCoin, 1);

  // triggers Unpause event
  await unpauseAsset(pausedStableCoin);

  // keep paused state
  await pauseAsset(pausedStableCoin);

  return pausedStableCoin;
};
