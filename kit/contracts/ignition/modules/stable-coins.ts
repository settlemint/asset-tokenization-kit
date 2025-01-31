import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import StableCoinFactoryModule from './stable-coin-factory';

const StableCoinsModule = buildModule('StableCoinsModule', (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { stableCoinFactory } = m.useModule(StableCoinFactoryModule);

  const collateralLivenessSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
  const createUSDC = m.call(stableCoinFactory, 'create', ['USD Coin', 'USDC', 6, '', collateralLivenessSeconds], {
    id: 'createUSDC',
    from: deployer,
  });
  const readUSDCAddress = m.readEventArgument(createUSDC, 'StableCoinCreated', 'token', { id: 'readUSDCAddress' });
  const usdc = m.contractAt('StableCoin', readUSDCAddress, { id: 'usdc' });

  // Set up roles for the stablecoin
  const supplyManagementRole = '0x5a6feb5c973d4f1e5b73d7b4429f99d9d6e1f71ae8911c7d8b1f84f4e0f2f1c0';
  const userManagementRole = '0x2f2c0f4f96d5f4c6d4c2d4f2c0f4f96d5f4c6d4c2d4f2c0f4f96d5f4c6d4c2d';

  // Grant roles to the deployer
  m.call(usdc, 'grantRole', [supplyManagementRole, deployer], { id: 'grantSupplyRole' });
  m.call(usdc, 'grantRole', [userManagementRole, deployer], { id: 'grantUserRole' });

  return { usdc };
});

export default StableCoinsModule;
