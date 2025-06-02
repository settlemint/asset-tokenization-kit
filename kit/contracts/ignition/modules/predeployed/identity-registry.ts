import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const IdentityRegistryModule = buildModule("IdentityRegistryModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const identityRegistry = m.contract("SMARTIdentityRegistryImplementation", [
    forwarder,
  ]);

  return { identityRegistry };
});

export default IdentityRegistryModule;
