import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const DeploymentRegistryModule = buildModule(
  "DeploymentRegistryModule",
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const deploymentRegistry = m.contract("SMARTDeploymentRegistry", [
      forwarder,
    ]);

    return { deploymentRegistry };
  }
);

export default DeploymentRegistryModule;
