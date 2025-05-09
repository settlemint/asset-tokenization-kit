import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ForwarderModule = buildModule("ForwarderModule", (m) => {
  const forwarder = m.contract("Forwarder");

  return { forwarder };
});

export default ForwarderModule;
