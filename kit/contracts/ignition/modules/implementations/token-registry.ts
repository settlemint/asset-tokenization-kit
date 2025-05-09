import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeploymentRegistryModule from "./deployment-registry";
import ForwarderModule from "./forwarder";

const TokenRegistryModule = buildModule("TokenRegistryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);
  const { deploymentRegistry } = m.useModule(DeploymentRegistryModule);

  const deployer = m.getAccount(0);

  const tokenRegistry = m.contract("SMARTTokenRegistry", [forwarder, deployer]);

  return { tokenRegistry };
});

export default TokenRegistryModule;
