import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import BondsModule from './bonds';
import CryptoCurrenciesModule from './crypto-currencies';
import EquitiesModule from './equities';
import FixedYieldFactoryModule from './fixed-yield-factory';
import StableCoinsModule from './stable-coins';

const AssetTokenizationModule = buildModule('AssetTokenizationModule', (m) => {
  const { ustb } = m.useModule(BondsModule);
  const { btc } = m.useModule(CryptoCurrenciesModule);
  const { usdc } = m.useModule(StableCoinsModule);
  const { aapl } = m.useModule(EquitiesModule);
  const { fixedYieldFactory } = m.useModule(FixedYieldFactoryModule);

  return { ustb, btc, usdc, aapl, fixedYieldFactory };
});

export default AssetTokenizationModule;
