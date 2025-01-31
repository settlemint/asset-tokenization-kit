import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import EquityFactoryModule from './equity-factory';

const EquitiesModule = buildModule('EquitiesModule', (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { equityFactory } = m.useModule(EquityFactoryModule);

  const equityClass = 'Common Stock';
  const equityCategory = 'Technology';
  const createAPPL = m.call(
    equityFactory,
    'create',
    ['Apple Inc.', 'AAPL', 0, 'US0378331005', equityClass, equityCategory],
    {
      id: 'createAPPL',
      from: deployer,
    }
  );
  const readAPPLAddress = m.readEventArgument(createAPPL, 'EquityCreated', 'token', { id: 'readAPPLAddress' });
  const aapl = m.contractAt('Equity', readAPPLAddress, { id: 'aapl' });

  // Set up roles for the equity
  const supplyManagementRole = '0x5a6feb5c973d4f1e5b73d7b4429f99d9d6e1f71ae8911c7d8b1f84f4e0f2f1c0';
  const userManagementRole = '0x2f2c0f4f96d5f4c6d4c2d4f2c0f4f96d5f4c6d4c2d4f2c0f4f96d5f4c6d4c2d';

  // Grant roles to the deployer
  m.call(aapl, 'grantRole', [supplyManagementRole, deployer], { id: 'grantSupplyRole' });
  m.call(aapl, 'grantRole', [userManagementRole, deployer], { id: 'grantUserRole' });

  return { aapl };
});

export default EquitiesModule;
