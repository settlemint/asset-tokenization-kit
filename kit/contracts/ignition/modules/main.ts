import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SystemFactoryModule from "./predeployed/system-factory";

/**
 * This module is used to deploy the SMART contracts, this should be used to
 * bootstrap a public network. For SettleMint consortium networks this is handled
 * by predeploying in the genesis file.
 */
const ATKModule = buildModule("ATKModule", (m) => {
  const { systemFactory } = m.useModule(SystemFactoryModule);

  return {
    systemFactory,
  };
});

export default ATKModule;
