import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { keccak256, toUtf8Bytes } from 'ethers';
import TokenizedDepositFactoryModule from './tokenized-deposit-factory';

const TokenizedDepositsModule = buildModule('TokenizedDepositsModule', (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { tokenizedDepositFactory } = m.useModule(
    TokenizedDepositFactoryModule
  );

  // Set collateral liveness to 30 days (in seconds)
  const collateralLivenessSeconds = 30 * 24 * 60 * 60;

  const createTokenizedEUR = m.call(
    tokenizedDepositFactory,
    'create',
    ['Euro Deposits', 'EUR', 2, collateralLivenessSeconds],
    {
      id: 'createTokenizedEUR',
      from: deployer,
    }
  );
  const readTokenizedEURAddress = m.readEventArgument(
    createTokenizedEUR,
    'TokenizedDepositCreated',
    'token',
    { id: 'readTokenizedEURAddress' }
  );
  const tEUR = m.contractAt('TokenizedDeposit', readTokenizedEURAddress, {
    id: 'tEUR',
  });

  // Set up roles for the tokenized deposit
  const supplyManagementRole = keccak256(toUtf8Bytes('SUPPLY_MANAGEMENT_ROLE'));
  const userManagementRole = keccak256(toUtf8Bytes('USER_MANAGEMENT_ROLE'));

  // Grant roles to the deployer
  m.call(tEUR, 'grantRole', [supplyManagementRole, deployer], {
    id: 'grantSupplyRole',
  });
  m.call(tEUR, 'grantRole', [userManagementRole, deployer], {
    id: 'grantUserRole',
  });

  // Mint and burn some tokens
  const mintAmount = 1000000000; // 1000 EUR with 2 decimals
  const burnAmount = 200000000; // 200 EUR with 2 decimals

  // Update collateral before minting (to ensure sufficient collateral)
  const updateCollateral = m.call(tEUR, 'updateCollateral', [mintAmount], {
    id: 'updateCollateral',
  });

  const mintTokenizedEUR = m.call(tEUR, 'mint', [deployer, mintAmount], {
    id: 'mintTokenizedEUR',
    after: [updateCollateral],
  });
  m.call(tEUR, 'burn', [burnAmount], {
    id: 'burnTokenizedEUR',
    after: [mintTokenizedEUR],
  });

  return { tEUR };
});

export default TokenizedDepositsModule;
