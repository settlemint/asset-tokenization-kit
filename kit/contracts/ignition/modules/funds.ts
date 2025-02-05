import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { keccak256, toUtf8Bytes } from 'ethers';
import FundFactoryModule from './fund-factory';

const FundsModule = buildModule('FundsModule', (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { fundFactory } = m.useModule(FundFactoryModule);

  const managementFeeBps = 200; // 2% annual management fee
  const createHedgeFund = m.call(
    fundFactory,
    'create',
    ['Global Macro Fund', 'GMF', 6, 'US0378331005', 'Hedge Fund', 'Global Macro', managementFeeBps],
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
  const supplyManagementRole = keccak256(toUtf8Bytes('SUPPLY_MANAGEMENT_ROLE'));
  const userManagementRole = keccak256(toUtf8Bytes('USER_MANAGEMENT_ROLE'));

  // Grant roles to the deployer
  m.call(gmf, 'grantRole', [supplyManagementRole, deployer], { id: 'grantSupplyRole' });
  m.call(gmf, 'grantRole', [userManagementRole, deployer], { id: 'grantUserRole' });

  // Mint and burn some tokens
  const mintAmount = 1000000000; // 1000 fund units with 6 decimals
  const burnAmount = 200000000; // 200 fund units with 6 decimals

  const mintFund = m.call(gmf, 'mint', [deployer, mintAmount], { id: 'mintFund' });
  m.call(gmf, 'burn', [burnAmount], { id: 'burnFund', after: [mintFund] });

  return { gmf };
});

export default FundsModule;
