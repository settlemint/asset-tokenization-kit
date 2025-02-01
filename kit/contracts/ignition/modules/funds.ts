import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import FundFactoryModule from './fund-factory';

const FundsModule = buildModule('FundsModule', (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { fundFactory } = m.useModule(FundFactoryModule);

  const managementFeeBps = 200; // 2% annual management fee
  const createHedgeFund = m.call(
    fundFactory,
    'create',
    ['Global Macro Fund', 'GMF', 6, 'US0378331005', managementFeeBps, 'Hedge Fund', 'Global Macro'],
    {
      id: 'createHedgeFund',
      from: deployer,
    }
  );
  const readHedgeFundAddress = m.readEventArgument(createHedgeFund, 'FundCreated', 'token', {
    id: 'readHedgeFundAddress',
  });
  const gmf = m.contractAt('Fund', readHedgeFundAddress, { id: 'gmf' });

  // Set up roles for the fund
  const supplyManagementRole = '0x5a6feb5c973d4f1e5b73d7b4429f99d9d6e1f71ae8911c7d8b1f84f4e0f2f1c0';
  const userManagementRole = '0x2f2c0f4f96d5f4c6d4c2d4f2c0f4f96d5f4c6d4c2d4f2c0f4f96d5f4c6d4c2d';

  // Grant roles to the deployer
  m.call(gmf, 'grantRole', [supplyManagementRole, deployer], { id: 'grantSupplyRole' });
  m.call(gmf, 'grantRole', [userManagementRole, deployer], { id: 'grantUserRole' });

  return { gmf };
});

export default FundsModule;
