import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import CryptoCurrencyFactoryModule from './crypto-currency-factory';

const CryptoCurrenciesModule = buildModule('CryptoCurrenciesModule', (m) => {
  const { cryptoCurrencyFactory } = m.useModule(CryptoCurrencyFactoryModule);

  const totalSupply = '21000000000000000000000000'; // 21M BTC with 18 decimals
  const createBTC = m.call(cryptoCurrencyFactory, 'create', ['Bitcoin', 'BTC', totalSupply], {
    id: 'createBTC',
  });
  const readBTCAddress = m.readEventArgument(createBTC, 'CryptoCurrencyCreated', 'token', { id: 'readBTCAddress' });
  const btc = m.contractAt('CryptoCurrency', readBTCAddress, { id: 'btc' });

  return { btc };
});

export default CryptoCurrenciesModule;
