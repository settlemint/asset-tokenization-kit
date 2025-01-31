import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
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
  const supplyManagementRole = '0x5a6feb5c973d4f1e5b73d7b4429f99d9d6e1f71ae8911c7d8b1f84f4e0f2f1c0';

  // Grant roles to the deployer
  m.call(btc, 'grantRole', [supplyManagementRole, deployer], { id: 'grantSupplyRole' });

  return { btc };
});

export default CryptoCurrenciesModule;
