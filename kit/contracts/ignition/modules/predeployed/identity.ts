import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const IdentityModule = buildModule("IdentityModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const identity = m.contract("SMARTIdentityImplementation", [forwarder]);
  const tokenIdentity = m.contract("SMARTTokenIdentityImplementation", [
    forwarder,
  ]);

  return { identity, tokenIdentity };
});

export default IdentityModule;
