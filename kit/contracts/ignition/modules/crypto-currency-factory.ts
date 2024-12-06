import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CryptoCurrencyFactoryModule = buildModule('CryptoCurrencyFactoryModule', (m) => {
  const cryptoCurrencyFactory = m.contract('CryptoCurrencyFactory');

  return { cryptoCurrencyFactory };
});

export default CryptoCurrencyFactoryModule;
