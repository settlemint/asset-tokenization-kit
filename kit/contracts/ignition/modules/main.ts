import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import BondsModule from "./bonds";
import CryptoCurrenciesModule from "./crypto-currencies";
import DepositsModule from "./deposits";
import EquitiesModule from "./equities";
import FixedYieldFactoryModule from "./fixed-yield-factory";
import ForwarderModule from "./forwarder";
import FundsModule from "./funds";
import StableCoinsModule from "./stable-coins";

const AssetTokenizationModule = buildModule("AssetTokenizationModule", (m) => {
  m.useModule(ForwarderModule);
  const { ustb } = m.useModule(BondsModule);
  const { btc } = m.useModule(CryptoCurrenciesModule);
  const { usdc } = m.useModule(StableCoinsModule);
  const { aapl } = m.useModule(EquitiesModule);
  const { gmf } = m.useModule(FundsModule);
  const { EURD } = m.useModule(DepositsModule);
  const { fixedYieldFactory } = m.useModule(FixedYieldFactoryModule);

  return { ustb, btc, usdc, aapl, gmf, EURD, fixedYieldFactory };
});

export default AssetTokenizationModule;
