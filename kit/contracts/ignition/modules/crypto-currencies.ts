import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { keccak256, toUtf8Bytes } from 'ethers';
import CryptoCurrencyFactoryModule from './crypto-currency-factory';

const CryptoCurrenciesModule = buildModule('CryptoCurrenciesModule', (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { cryptoCurrencyFactory } = m.useModule(CryptoCurrencyFactoryModule);

  const totalSupply = '21000000000000000000000000'; // 21M BTC with 18 decimals
  const createBTC = m.call(cryptoCurrencyFactory, 'create', ['Bitcoin', 'BTC', 18, totalSupply], {
    id: 'createBTC',
    from: deployer,
  });
  const readBTCAddress = m.readEventArgument(createBTC, 'CryptoCurrencyCreated', 'token', { id: 'readBTCAddress' });
  const btc = m.contractAt('CryptoCurrency', readBTCAddress, { id: 'btc' });

  // Set up roles for the cryptocurrency
  const supplyManagementRole = keccak256(toUtf8Bytes('SUPPLY_MANAGEMENT_ROLE'));

  // Grant roles to the deployer
  m.call(btc, 'grantRole', [supplyManagementRole, deployer], { id: 'grantSupplyRole' });

  return { btc };
});

export default CryptoCurrenciesModule;
