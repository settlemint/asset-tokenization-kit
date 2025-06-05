import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import BondModule from "./predeployed/assets/bond";
import DepositModule from "./predeployed/assets/deposit";
import EquityModule from "./predeployed/assets/equity";
import FundModule from "./predeployed/assets/fund";
import StableCoinModule from "./predeployed/assets/stablecoin";
import FixedYieldScheduleFactoryModule from "./predeployed/fixed-yield-schedule-factory";
import SystemFactoryModule from "./predeployed/system-factory";

/**
 * This module is used to deploy the SMART contracts, this should be used to
 * bootstrap a public network. For SettleMint consortium networks this is handled
 * by predeploying in the genesis file.
 */
const SMARTModule = buildModule("SMARTModule", (m) => {
  const { systemFactory } = m.useModule(SystemFactoryModule);
  const { bondImplementation, bondFactoryImplementation } =
    m.useModule(BondModule);
  const { depositImplementation, depositFactoryImplementation } =
    m.useModule(DepositModule);
  const { equityImplementation, equityFactoryImplementation } =
    m.useModule(EquityModule);
  const { fundImplementation, fundFactoryImplementation } =
    m.useModule(FundModule);
  const { stablecoinImplementation, stablecoinFactoryImplementation } =
    m.useModule(StableCoinModule);
  const { fixedYieldScheduleFactory } = m.useModule(
    FixedYieldScheduleFactoryModule
  );

  return {
    systemFactory,
    bondImplementation,
    bondFactoryImplementation,
    depositImplementation,
    depositFactoryImplementation,
    equityImplementation,
    equityFactoryImplementation,
    fixedYieldScheduleFactory,
    fundImplementation,
    fundFactoryImplementation,
    stablecoinImplementation,
    stablecoinFactoryImplementation,
  };
});

export default SMARTModule;
