import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const IdentityModule = buildModule("IdentityModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const identity = m.contract("ATKIdentityImplementation", [forwarder]);
  const contractIdentity = m.contract("ATKContractIdentityImplementation", [
    forwarder,
  ]);

  return { identity, contractIdentity };
});

export default IdentityModule;
