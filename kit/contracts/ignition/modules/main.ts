import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const AssetTokenizationModule = buildModule('AssetTokenizationModule', (m) => {
  const cryptoCurrencyFactory = m.contract('CryptoCurrencyFactory');
  const stableCoinFactory = m.contract('StableCoinFactory');
  const equityFactory = m.contract('EquityFactory');
  const bondFactory = m.contract('BondFactory');

  return { cryptoCurrencyFactory, stableCoinFactory, equityFactory, bondFactory };
});

export default AssetTokenizationModule;
