import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import BondsModule from './bonds';
import CryptoCurrenciesModule from './crypto-currencies';
import EquitiesModule from './equities';
import StableCoinsModule from './stable-coins';

const AssetTokenizationModule = buildModule('AssetTokenizationModule', (m) => {
  const { ustb } = m.useModule(BondsModule);
  const { btc } = m.useModule(CryptoCurrenciesModule);
  const { usdc } = m.useModule(StableCoinsModule);
  const { aapl } = m.useModule(EquitiesModule);

  return { ustb, btc, usdc, aapl };
});

export default AssetTokenizationModule;
